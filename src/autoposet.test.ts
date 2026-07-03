import { it, expect } from 'vitest'
import { BestLine } from './bestlines.js'
import { CsvPuzzle, read_csv } from './db.js'
import fs from 'fs'
import { AutoPoset } from './autoposet.js'
import { DebugMove } from './debug.js'

//@ts-ignore
import '../data/more100.oof?raw'
//@ts-ignore
import '../data/more200.oof?raw'
import { ScriptFilter, ScriptRunner } from './runner.js'

let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 100).reverse()
let puzzles200 = puzzles.slice(100, 200).reverse()

let fundamentals = read_oof(fs.readFileSync('data/more100.oof').toString())
let more200 = read_oof(fs.readFileSync('data/more200.oof').toString())

function read_oof(oof: string): [string, string][] {
    let result: [string, string][] = []
    for (let blocks of oof.split(/\r?\n\r?\n/)) {
        let [script, ...text] = blocks.split(/\r?\n/)

        if (script.includes(':')) {
            let [name, preview] = script.split(':')

            if (preview.includes('skip')) {
                continue
            }

            let m = preview.match(/@preview\(single=(\d*)\)/)
            if (m) {
                let single = parseInt(m[1])

                let csv = puzzles100.find(_ => _.index === single) ?? puzzles200.find(_ => _.index === single)!


                const solutionSans = DebugMove.ucisAsSans(csv.position, csv.solution)
                const solutionMoves = DebugMove.ucisAsMoves(csv.position, csv.solution)

                const message = `
${csv.index} https://lichess.org/training/${csv.id}
[${solutionSans.join(' ')}]
`.trim()

                console.log(message)


                let test = ScriptRunner.parse(text.join('\n'))
                console.log(test.runOnPosition(csv.position).preview)

                return []
            }

        }

        result.push([script.trim(), text.join('\n')])
    }
    return result
}

it('basic usage only', { timeout: 1000000 }, () => {

    let script_set = [...fundamentals, ...more200]
    let puzzle_set = puzzles200

    let autoposet = new AutoPoset(script_set)

    let poset_puzzles: CsvPuzzle[] = []
    let posets: string[][] = []
    for (let puzzle of puzzle_set) {
        let poset = autoposet.getPoset(puzzle)

        if (poset.length <= 1) {
            continue
        }

        if (posets.find(_ => _.join(' ') === poset.join(' '))) {
            continue
        }
        posets.push(poset)
        poset_puzzles.push(puzzle)
    }

    for (let i = 0; i < posets.length; i++) {
        let poset = posets[i]
        for (let k = i + 1; k < posets.length; k++) {
            let posetb = posets[k]
            if (poset.length !== posetb.length) {
                continue
            }

            if (poset.every(a => posetb.indexOf(a) !== -1)) {
                let puzzle_a = poset_puzzles[i]
                let puzzle_b = poset_puzzles[k]

                console.log(`Poset Clash: \n${poset.join('\n')}`)
                console.log(`${puzzle_a.index} https://lichess.org/training/${puzzle_a.id}`)
                console.log(`${puzzle_b.index} https://lichess.org/training/${puzzle_b.id}`)
                return
            }
        }
    }

    let bestLine = new BestLine(script_set, posets)

    let all_done = true

    let nb_solved = []

    for (let i = 0; i < puzzle_set.length; i++) {

        const solutionSans = DebugMove.ucisAsSans(puzzle_set[i].position, puzzle_set[i].solution)
        const solutionMoves = DebugMove.ucisAsMoves(puzzle_set[i].position, puzzle_set[i].solution)

        const message = `
${puzzle_set[i].index} https://lichess.org/training/${puzzle_set[i].id}
[${solutionSans.join(' ')}]
`.trim()

        const res = bestLine.findBestLine(puzzle_set[i].position)

        let error_matches = ''
        let errors = ''

        if (res.bestTreeScripts.length === 0) {
            errors += 'Negative'
        }

        outer: for (let k = 0; k < res.bestTreeScripts.length; k++) {
            const bestLineScripts = res.bestTreeScripts[k][1].getLinesWithOpponentMoves(solutionMoves)
            if (bestLineScripts) {
                const bestLine = DebugMove.movesAsSans(puzzle_set[i].position, bestLineScripts[0])
                let is_mismatch = false
                for (let j = 0; j < solutionSans.length; j++) {
                    if (solutionSans[j] !== bestLine[j]) {
                        is_mismatch = true
                        break
                    }
                }

                if (is_mismatch) {
                    if (errors.length > 0) errors += '\n'
                    errors += (`${res.bestTreeScripts[k][0]}: `)
                    errors += (`{${bestLine.join(' ')}}`)
                } else {
                    if (errors.length === 0) break
                    if (error_matches.length > 0) error_matches += '\n'
                    error_matches += (`${res.bestTreeScripts[k][0]}: `)
                    error_matches += (`{${bestLine.join(' ')}}`)
                }
            }
        }

        if (errors.length > 0) {
            console.log(message)
            console.log(errors)
            if (error_matches.length > 0) {
                console.log(`Error matches: `)
                console.log(error_matches)
            }
            console.log('')
            all_done = false
        } else {
            nb_solved.push(i)
        }
    }

    if (all_done)
        console.log('All done!')

    let stats = ''
    stats += `Solved: ${nb_solved.length}/${puzzle_set.length} `
    stats += `Scripts: ${script_set.length} `
    stats += `Posets: ${posets.length}`
    console.log(stats)


})
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
//@ts-ignore
import '../data/more300.oof?raw'
import { ScriptFilter, ScriptRunner } from './runner.js'
import { Debug, Fen, Files, Position, Ranks } from './types.js'

let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles200 = puzzles.slice(0, 300).reverse()

let skips = [244, 269]

let fundamentals = read_oof(fs.readFileSync('data/more100.oof').toString().trim())
let more200 = read_oof(fs.readFileSync('data/more200.oof').toString().trim())
let more300 = read_oof(fs.readFileSync('data/more300.oof').toString().trim())

function read_oof(oof: string): [string, string][] {
    if (oof.length === 0) {
        return []
    }
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

                let csv = puzzles200.find(_ => _.index === single) ?? puzzles200.find(_ => _.index === single)!


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

    if (fundamentals.length === 0 || more200.length === 0 || more300.length === 0) {
        return
    }

    let script_set = [...fundamentals, ...more200, ...more300]
    let puzzle_set = puzzles200

    let clashes = ''
    for (let i = 0; i < script_set.length; i++) {
        for (let j = i + 1; j < script_set.length; j++) {
            if (script_set[i][0] === script_set[j][0]) {
                clashes += `Name Clash: ${script_set[i][0]}\n`
            }
        }
    }
    if (clashes.length > 0) {
        console.log(clashes)
        return
    }

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
        if (skips.includes(puzzle_set[i].index)) continue

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
    stats += `Scripts: ${fundamentals.length}+${more200.length}+${more300.length} `
    stats += `Posets: ${posets.length}`
    console.log(stats)
})
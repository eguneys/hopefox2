import { it, expect } from 'vitest'
import { BestLine } from './bestlines.js'
import { read_csv } from './db.js'
import fs from 'fs'
import { AutoPoset } from './autoposet.js'
import { DebugMove } from './debug.js'

//@ts-ignore
import '../data/first100.oof?raw'
import { ScriptFilter, ScriptRunner } from './runner.js'

let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 100).reverse()

let fundamentals = read_oof(fs.readFileSync('data/first100.oof').toString())

function read_oof(oof: string): [string, string][] {
    let result: [string, string][] = []
    for (let blocks of oof.split(/\r?\n\r?\n/)) {
        let [script, ...text] = blocks.split(/\r?\n/)

        if (script.includes(':')) {
            let [name, preview] = script.split(':')

            let m = preview.match(/@preview\(single=(\d*)\)/)
            if (m) {
                let single = parseInt(m[1])

                let csv = puzzles100.find(_ => _.index === single)!

                let test = ScriptRunner.parse(text.join('\n'))
                console.log(test.runOnPosition(csv.position).preview)

                return []
            }

        }

        result.push([script.trim(), text.join('\n')])
    }
    return result
}

it('basic usage only', () => {

    if (fundamentals.length === 0) {
        return
    }

    let autoposet = new AutoPoset(fundamentals)

    let posets: string[][] = []
    for (let puzzle of puzzles100)
        posets.push(autoposet.getPoset(puzzle))

    posets = posets.filter(_ => _.length > 1)
    posets = posets.filter(a => !posets.find(b => a !== b && b.join(' ') === a.join(' ')))

    let bestLine = new BestLine(fundamentals, posets)

    let all_done = true

    let nb_solved = []

    for (let i = 0; i < puzzles100.length; i++) {

        const solutionSans = DebugMove.ucisAsSans(puzzles100[i].position, puzzles100[i].solution)
        const solutionMoves = DebugMove.ucisAsMoves(puzzles100[i].position, puzzles100[i].solution)

        const message = `
${puzzles100[i].index} https://lichess.org/training/${puzzles100[i].id}
[${solutionSans.join(' ')}]
`.trim()

        const res = bestLine.findBestLine(puzzles100[i].position)

        let error_matches = ''
        let errors = ''

        if (res.bestTreeScripts.length === 0) {
            errors += 'Negative'
        }

        outer: for (let k = 0; k < res.bestTreeScripts.length; k++) {
            const bestLineScripts = res.bestTreeScripts[k][1].getLinesWithOpponentMoves(solutionMoves)
            if (bestLineScripts) {
                const bestLine = DebugMove.movesAsSans(puzzles100[i].position, bestLineScripts[0])
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

    console.log(`Total Solved: ${nb_solved.length}`)
    console.log(`Total Scripts: ${fundamentals.length}`)
    console.log(`Total Posets: ${posets.length}`)


})
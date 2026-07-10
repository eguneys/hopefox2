import { read_csv } from "./db.js";
import { expect, it } from "vitest";
import fs from 'fs'
import { read_oof } from "./autoposet.test.js";
import { BestLine } from "./bestlines.js";
import { DebugMove } from "./debug.js";
import { AutoGen } from "./autogen.js";

//@ts-ignore
import '../data/pin3.oof?raw'

let puzzles = read_csv(fs.readFileSync('data/pin2_knight_checks_queen.FullFalse.dbsrc.csv').toString())

let pin3 = read_oof(fs.readFileSync('data/pin3.oof').toString().trim(), puzzles)

it('only basic usage', { timeout: 1000000 }, () => {
    let puzzle_set = puzzles.slice(36, 37)

    if (pin3.length === 0) {
        return
    }

    let script_set: [string, string][] = []
    let agen = AutoGen.fromScripts(pin3.map(_ => _[1]))

    for (let i = 0; i < puzzle_set.length; i++) {
        let { lists, indexes } = agen.genScriptsOnPosition(puzzle_set[i].position)
        for (let i = 0; i < lists.length; i++) {
            let list = lists[i]
            script_set.push([indexes[i].map(_ => pin3[_][0]).join(' '), list])
        }
    }

    let bestLine = new BestLine(script_set, [])

    let all_done = true

    let nb_solved = []

    for (let i = 0; i < puzzle_set.length; i++) {
        //if (skips.includes(puzzle_set[i].index)) continue

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
    stats += `Scripts: ${pin3.length}`
    console.log(stats)
})
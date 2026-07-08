import { read_oof } from "./autoposet.test.js";
import { BestLine } from "./bestlines.js";
import { read_csv } from "./db.js";
import fs from 'fs'
import { DebugMove } from "./debug.js";
import { expect, it } from "vitest";

//@ts-ignore
import '../data/pin2.oof?raw'
import { DebugParser } from "./types.js";
import { AutoGen } from "./autogen.js";

let puzzles = read_csv(fs.readFileSync('data/pin2_knight_checks_queen.FullFalse.dbsrc.csv').toString())

let skips: number[] = []

let pin2 = read_oof(fs.readFileSync('data/pin2.oof').toString().trim(), puzzles)


it('basic usage', { timeout: 1000000 }, () => {

    if (pin2.length === 0) {
        return
    }

    let script_set = [...pin2]
    let puzzle_set = puzzles


    let bestLine = new BestLine(script_set, [])

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
    stats += `Scripts: ${pin2.length}`
    console.log(stats)


})


it('auto gen hanging rook check trap', () => {


    const ctr_knight_check = DebugParser.Position(`
.kr..bnr
ppp..ppp
q...p...
...pN...
...P.B..
P.NbP...
.P...PPP
R.K.QB.R
`.trim())

    const scripts = AutoGen.run(ctr_knight_check)

    expect(scripts.length).toBe(1)
    expect(scripts[0]).toBe(`
rook_o .hanging
knight_t *Checks rook *becomes knight2
         .notAttacked
         .noSafeEvadableFor rook
`.trim())

})



it('only auto gen hanging rook check trap', () => {


    const ctr_knight_check = DebugParser.Position(`
.kr..bnr
ppp..ppp
..q.p...
...p....
...P.B..
P.NbPN..
.P...PPP
R.K.QB.R
`.trim())

    const scripts = AutoGen.run(ctr_knight_check)

    expect(scripts.length).toBe(1)
    expect(scripts[0]).toBe(`
rook_o .hanging
bishop_o .hanging
knight_t *Forks queen_o *and bishop *becomes knight2
queen *SingleSafeDefendFor bishop *becomes queen2
rook .hanging
knight2 *Checks rook *becomes knight3
        .notAttacked
        .noSafeEvadableFor rook
`.trim())

})
import { it, expect } from 'vitest'
import { Orchestrator } from './orchestrator.js'

import fs from 'node:fs'
import { read_csv } from './db.js'
import { BestLine } from './bestlines.js'
import { DebugMove } from './debug.js'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(60, 70)




it('basic usage only', () => {

        let more: [string, string][] = [
                ['ctq_rook_fork.gof', `
rook_t *Forks king_o *and queen_o *becomes rook2
       .Checks king
bishop_t *Blocks Check *becomes bishop2
rook2 *Captures queen *becomes rook3
`.trim()],
                ['ctb_hanging_rook_exchange.gof', `
rook_o .hanging
knight_t *Captures rook *becomes knight2
bishop_t *Captures rook2_o *becomes bishop2
pawn_t *Captures bishop2 *becomes pawn2
 `.trim()],
                ['mate_pawn_push_rook.gof', `
pawn_t *Pushes sq *becomes pawn2
       .Checks king_t
king_t *EvadesTo sq *becomes king2
rook_t *Checks king2 *becomes rook2
`.trim()],
                ['ctb_queen_unpin_discovery.gof', `
bishop_o .eyesThrough queen_t .through knight_t
knight_t *Captures knight2_o *becomes knight3
bishop2_t *Captures knight3 *becomes bishop3
queen *Captures bishop *becomes queen2
`.trim()],
                ['mate_qs_corner_with_rook.gof', `
queen_t *Captures rook_o *becomes queen2
        .Checks king_t
rook2_t  *Captures queen2 *becomes rook3
                                     .hanging
rook4_t *Captures rook3 *becomes rook5
        .Checks king_t
`.trim()],

                ['brmate_qf7_capture.gof', `
queen_t *Captures pawn_o *becomes queen2
        .Checks king_t
king    *EvadesTo sq *becomes king2
queen2  *Checks king2 *becomes queen3
rook_t  *Captures queen3 *becomes rook2
                                    .hanging
rook3_t *Captures rook2 *becomes rook4
        .Checks king2
`.trim()],

                ['ctb_rook_fork.gof', `
bishop_o .hanging
rook_t *Forks king_o *and bishop *becomes rook2
king *EvadesTo sq *becomes king2
rook2 *Captures bishop *becomes rook3
`.trim()],

                ['bmate_qs_v_rook.gof', `
queen_t *Checks king_o *becomes queen2
rook_t *Captures queen2 *becomes rook2
                                  .hanging
rook3_t *Captures rook2 *becomes rook4
        .Checks king
`.trim()],





        ]

        const recall_posets = [
                ['bmate_qs_v_rook.gof', 'mate_qs_corner_with_rook.gof', 'ctb_queen_fork.gof', 'qzmate_corner_with_rook.gof', 'queen_mate.gof']
        ]

        const more_posets = [
                ['ctq_rook_fork.gof', 'bmate_queen_block_bishop.gof', 'queen_mate.gof', 'two.gof'],

                ['ctb_hanging_rook_exchange.gof', 'push_pawns.gof'],
                ['mate_pawn_push_rook.gof', 'push_pawns.gof', 'two.gof'],
                ['ctb_queen_unpin_discovery.gof', 'ctn_unpin_queen.gof', 'push_pawns.gof'],
                ['mate_qs_corner_with_rook.gof', 'ctb_queen_fork.gof', 'qzmate_corner_with_rook.gof', 'queen_mate.gof'],
                ['brmate_qf7_capture.gof', 'push_pawns.gof', 'queen_mate.gof'],
                ['ctb_rook_fork.gof', 'rook_bishop_corner_mate.gof', 'push_pawns.gof', 'two.gof'],
                ['bmate_qs_v_rook.gof', 'qzmate_corner_with_rook.gof', 'queen_mate.gof', 'push_pawns.gof'],
        ]

        let fundamentals: [string, string][] = [
                ["one.gof", `
rook_t *Checks king_o *becomes rook2
rook3_t *Blocks Check *becomes rook4
rook2 *Captures rook4 *becomes rook5
      .Checks king
queen *Captures rook5 *becomes queen2
bishop *Captures queen2 *becomes bishop2
`.trim()],

                ['two.gof', `
rook_t *Checks king_o *becomes rook2
`.trim()],

                ['queen_mate.gof', `
queen_t *Checks king_o *becomes queen2
`.trim()],

                ['rook_backrank_block_mate.gof', `
rook_t *Checks king_o *becomes rook2
rook3_t *Blocks Check *becomes rook4
rook2 *Captures rook4 *becomes rook5
`.trim()],

                ['rook_exchange_hanging.gof', `
rook_t *Captures rook2 *becomes rook3
rook4_t *Captures rook3 *becomes rook5
rook6_t *Captures rook5 *becomes rook7
`.trim()],
                ['ctq_knight_fork.gof', `
knight_t *Forks king_o *and queen_o *becomes knight2
king *EvadesTo sq *becomes king2
knight2 *Captures queen *becomes knight3
`.trim()],

                ['rook_queen_liquidate.gof', `
queen_t *Captures rook_o *becomes queen2
queen3_t *Captures queen2 *becomes queen4
rook2_t *Captures queen4 *becomes rook3
`.trim()],


                ['ctr_knight_fork.gof', `
knight_t *Forks king_o *and rook_o *becomes knight2
king *EvadesTo sq *becomes king2
knight2 *Captures rook *becomes knight3
`.trim()],

                ['queen_backrank_block_mate.gof', `
queen_t *Checks king_o *becomes queen2
rook_t *Blocks Check *becomes rook2
queen2 *Captures rook2 *becomes queen3
`.trim()],



                ['ctq_knight_fork3.gof', `
knight_t *Forks king_o *and queen_o *becomes knight2
king *EvadesTo sq *becomes king2
knight2 *Captures queen *becomes knight3
`.trim()],


                ['queen_backrank_block_mate.gof', `
queen_t *Checks king_o *becomes queen2
rook_t *Blocks Check *becomes rook2
queen2 *Captures rook2 *becomes queen3
`.trim()],
                ['queen_backrank_block_mate.gof', `
queen_t *Checks king_o *becomes queen2
                                  .notAttacked
rook_t *Blocks Check *becomes rook2
queen2 *Captures rook2 *becomes queen3
`.trim()],

                ['queen_backrank_sacrifice_block_mate.gof', `
queen_t *Captures rook_o *becomes queen2
        .Checks king_t
bishop_t *Captures queen2 *becomes bishop2
rook2_t *Captures bishop2 *becomes rook3
        .Checks2 king_t
queen3_t *Blocks Check2 *becomes queen4
                                    .hanging
rook3 *Captures queen4 *becomes rook4
      .Checks3  king
`.trim()],
                ['rook_bishop_corner_mate.gof', `
rook_t *Checks king_o *becomes rook2
                                 .notAttacked
king *EvadesTo sq *becomes king2
rook2 *Checks king2 *becomes rook3
`.trim()],
                ['ctb_knight_fork.gof', `
knight_t *Forks king_o *and bishop_o *becomes knight2
king *EvadesTo sq *becomes king2
knight2 *Captures bishop *becomes knight3
`.trim()],

                ['bmate_rook_capture_queen_block.gof', `
rook_t *Captures rook2_o *becomes rook3
                                  .notAttacked
       .Checks king_t
queen_t *Blocks Check *becomes queen2
                                    .hanging
rook3 *Captures queen2 *becomes rook4
`.trim()],


                ['bmate_bishop_help_double_rook_exchange.gof', `
rook_t *Captures rook2_o *becomes rook3
       .Checks king_t
knight_t *Captures rook3 *becomes knight2
                                    .hanging
rook4_t *Captures knight2 *becomes rook5
`.trim()],

                ['qzmate_corner_with_rook.gof', `
queen_t *Captures rook_o *becomes queen2
`.trim()],

                ['ctb_hanging_queen_liquidate_checking_queen.gof', `
bishop_o .hanging
queen_t *Captures bishop *becomes queen2
queen3_t *Checks king_o *becomes queen4
         .Forks king .and queen2
queen2 *Captures queen4 *becomes queen5
`.trim()],



                ['bmate_queen_block_queen.gof', `
queen_t *Checks king_o *becomes queen2
queen3_t *Blocks Check *becomes queen4
queen2 *Captures queen4 *becomes queen5
`.trim()],

                ['nmate_in1.gof', `
knight_t *Checks king_o *becomes knight2
`.trim()],

                ['bmate_queen_block_bishop.gof', `
queen_t *Checks king_o *becomes queen2
bishop_t *Blocks Check *becomes bishop2
queen2 *Captures bishop2 *becomes queen3
`.trim()],

                ['skewer_rook_king_rook.gof', `
rook_t *Checks king_o *becomes rook2
       .eyesThrough rook3_t .through king
king *EvadesTo sq *becomes king2
rook2 *Captures rook3 *becomes rook4
`.trim()],

                ['ctq_knight_exchange.gof', `
knight_t *Captures knight2_o *becomes knight3
queen_t *Captures knight3 *becomes queen2
rook_t *Captures queen2 *becomes rook2
`.trim()],

                ['ctq_bishop_fork.gof', `
bishop_t *Forks king_o *and rook_o *becomes bishop2
         .Checks king
pawn *PushBlocks Check *becomes pawn2
bishop2 *Captures rook *becomes bishop3
`.trim()],


                ['ctb_rook_exchange.gof', `
rook_t *Captures rook2_o *becomes rook3
bishop_t *Captures rook3 *becomes bishop2
                                     .hanging
rook4_t *Captures bishop2 *becomes rook5
`.trim()],

                ['ctb_queen_exchange.gof', `
queen_t *Captures bishop_o *becomes queen2
queen3_t *Captures queen2 *becomes queen4
                                     .hanging
rook_t *Captures queen4 *becomes rook2
`.trim()],

                ['ctq_knight_fork2.gof', `
knight_t *Forks king_o *and queen_o *becomes knight2
king *Captures pawn_o *becomes king2
knight2 *Captures queen *becomes knight3
`.trim()],

                ['ctq_immediate_hang_to_knight.gof', `
bishop_o .hanging
knight_t *Captures bishop *becomes knight2
`.trim()],


                ['push_pawns.gof', `
pawn_t *Pushes sq *becomes pawn2
knight_t *MovesTo sq2 *becomes knight2
pawn2 *Pushes sq3 *becomes pawn3
`.trim()],

                ['ctb_queen_fork.gof', `
queen_t *Forks king_o *and bishop_o *becomes queen2
king *EvadesTo sq *becomes king2
queen2 *Captures bishop *becomes queen3
`.trim()],

                ['ctn_rook_fork.gof', `
rook_t *Forks king_o *and knight_o *becomes rook2
king *EvadesTo sq *becomes king2
rook2 *Captures knight *becomes rook3
`.trim()],

                ['ctr_hang_after_exchange.gof', `
queen_t *Captures queen2_o *becomes queen2
rook_t *Captures queen2 *becomes rook2
rook3_t *Captures rook2 *becomes rook4
`.trim()],

                ['ctn_unpin_queen.gof', `
bishop_o .eyesThrough queen_t *through knight_t
knight *Captures knight2_o *becomes knight3
                      .hanging
bishop *Captures queen_o *becomes bishop2
knight3 *Captures queen2_o *becomes knight4
`.trim()],


                ['bmate_rook_bishop_block.gof', `
queen_t *Checks king_o *becomes queen2
bishop_t *Blocks Check *becomes bishop2
                                .hanging
queen2 *Captures bishop2 *becomes queen3
       .Checks2 king
rook_t *Blocks Check2 *becomes rook2
                                .hanging
queen3 *Captures rook2 *becomes queen4
       .Checks2 king
`.trim()],

                ['ctr_bishop_fork.gof', `
bishop_t *Forks rook_o *and king_o *becomes bishop2
king *EvadesTo sq *becomes king2
bishop2 *Captures rook *becomes bishop3
`.trim()],
        ]

        const posets = [
                ['rook_backrank_block_mate.gof', 'rook_bishop_corner_mate.gof', 'two.gof'],
                ['rook_backrank_block_mate.gof', 'rook_bishop_corner_mate.gof', 'push_pawns.gof', 'two.gof'],
                ['rook_queen_liquidate.gof', 'queen_mate.gof', 'qzmate_corner_with_rook.gof', 'push_pawns.gof', 'ctb_queen_fork.gof'],
                ['rook_queen_liquidate.gof', 'queen_mate.gof', 'qzmate_corner_with_rook.gof', 'push_pawns.gof'],
                ['rook_backrank_block_mate.gof', 'rook_bishop_corner_mate.gof', 'nmate_in1.gof', 'push_pawns.gof', 'two.gof'],
                ['queen_backrank_block_mate.gof', 'bmate_queen_block_queen.gof', 'queen_mate.gof'],
                ['bmate_rook_capture_queen_block.gof', 'two.gof', 'rook_bishop_corner_mate.gof', 'push_pawns.gof'],
                ['queen_backrank_sacrifice_block_mate.gof', 'ctb_queen_fork.gof', 'bmate_queen_block_queen.gof', 'qzmate_corner_with_rook.gof', 'queen_mate.gof'],
                ['bmate_bishop_help_double_rook_exchange.gof', 'two.gof', 'skewer_rook_king_rook.gof', 'push_pawns.gof'],
                ['qzmate_corner_with_rook.gof', 'two.gof', 'ctn_rook_fork.gof', 'push_pawns.gof', 'queen_mate.gof'],
                ['rook_bishop_corner_mate.gof', 'two.gof'],
                ['ctr_bishop_fork.gof', 'push_pawns.gof'],
                ['ctq_knight_fork2.gof', 'ctq_knight_fork3.gof', 'ctq_knight_fork.gof', 'push_pawns.gof', 'nmate_in1.gof'],
                ['ctq_knight_fork.gof', 'ctq_knight_fork3.gof', 'push_pawns.gof', 'nmate_in1.gof', 'queen_mate.gof']

        ]

        const posets3 = [['ctb_hanging_queen_liquidate_checking_queen.gof',
                'queen_mate.gof',
                'queen_backrank_block_mate.gof',
                'bmate_queen_block_queen.gof',
                'bmate_queen_block_bishop.gof',
                'push_pawns.gof',
                'ctb_queen_fork.gof'],
        ['bmate_queen_block_queen.gof',
                'queen_mate.gof'],
        ['bmate_queen_block_bishop.gof',
                'queen_mate.gof',
                'push_pawns.gof'],
        ['ctq_knight_fork.gof',
                'ctq_knight_fork3.gof',
                'queen_mate.gof',
                'nmate_in1.gof',
                'ctq_knight_fork2.gof',
                'push_pawns.gof'],
        ['skewer_rook_king_rook.gof',
                'two.gof',
                'rook_bishop_corner_mate.gof'],
        ['ctb_rook_exchange.gof',
                'two.gof',
                'skewer_rook_king_rook.gof'],
        ['ctq_knight_fork2.gof',
                'ctq_knight_fork.gof',
                'ctq_knight_fork3.gof',
                'nmate_in1.gof',
                'push_pawns.gof'],
        ['ctn_rook_fork.gof',
                'two.gof',
                'push_pawns.gof'],
        ['ctr_hang_after_exchange.gof',
                'push_pawns.gof'],
        ['ctb_queen_fork.gof',
                'queen_mate.gof',
                'queen_backrank_block_mate.gof',
                'bmate_queen_block_queen.gof',
                'bmate_queen_block_bishop.gof'],
        ['ctn_unpin_queen.gof',
                'push_pawns.gof'],
        ['bmate_rook_bishop_block.gof',
                'queen_mate.gof',
                'queen_backrank_block_mate.gof',
                'bmate_queen_block_bishop.gof',
                'push_pawns.gof']
        ]


        let bestLine = new BestLine([
                ...fundamentals,
                ...more,
        ], [...posets, ...posets3, ...more_posets, ...recall_posets])

        let all_done = true

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
                }
        }

        if (all_done)
                console.log('All done!')



})
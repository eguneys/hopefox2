import { it, expect } from 'vitest'
import { Orchestrator } from './orchestrator.js'

import fs from 'node:fs'
import { read_csv } from './db.js'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 60)



it('basic usage only', () => {


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
king *Captures pawn *becomes king2
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

        //fundamentals = fundamentals.slice(-1)

        let orch = new Orchestrator(new Map([
                ...fundamentals,
        ]))

        const res = orch.filterPuzzles(puzzles100)

        console.log(res)

})
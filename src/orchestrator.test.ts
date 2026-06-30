import { it, expect } from 'vitest'
import { Orchestrator } from './orchestrator.js'

import fs from 'node:fs'
import { read_csv } from './db.js'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 20)



it('basic usage', () => {


        const fundamentals: [string, string][] = [
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
        ]

        let orch = new Orchestrator(new Map([
                ...fundamentals
        ]))

        const res = orch.filterPuzzles(puzzles100)

        console.log(res)

})
import { it, expect } from 'vitest'
import { Orchestrator } from './orchestrator.js'

import fs from 'node:fs'
import { read_csv } from './db.js'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 10)



it('basic usage only', () => {

    let orch = new Orchestrator(new Map([
        ["one.gof", `
rook_t *Checks king_o *becomes rook2
rook3_t *Blocks Check *becomes rook4
rook2 *Captures rook4 *becomes rook5
      .Checks king
queen *Captures rook5 *becomes queen2
bishop *Captures queen2 *becomes bishop2
`.trim()],

    ]))

    const res = orch.filterPuzzles(puzzles100.filter(_ => _.id === '01GC2'))

    console.log(res)

})
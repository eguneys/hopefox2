import { it, expect } from 'vitest'
import { ScriptFilter, ScriptRunner } from './runner.js'
import { read_csv } from './db.js'

import fs from 'node:fs'
import { DebugParser } from './types.js'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 1)

it.only('basic usage', () => {

    let filter = new ScriptFilter(`
rook_t *Checks king_o *becomes rook2
rook3_t *Blocks Check *becomes rook4
rook2 *Captures rook4 *becomes rook5
      .Checks king
queen *Captures rook5 *becomes queen2
bishop *Captures queen2 *becomes bishop2
`.trim())

    let res = filter.filterPuzzles(puzzles100, [])

    const negative = res.filter(_ => _.negative)
    res = res.filter(_ => _.exact_solution)

    console.log(negative[0].preview)

})


it('runOnPosition', () => {

    let runner = ScriptRunner.parse('rook *Checks king *becomes rook2')

    let { moves, preview } = runner.runOnPosition(DebugParser.Position(`
.....k..
.....p..
........
........
........
........
........
..R.....
`))

    expect(preview).toEqual('1: {Rc8+}')

})
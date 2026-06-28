import { it, expect } from 'vitest'
import { ScriptFilter, ScriptRunner } from './runner.js'
import { read_csv } from './db.js'

import fs from 'node:fs'
import { DebugParser } from './types.js'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())

it.only('basic usage', () => {

    let filter = new ScriptFilter(`
rook_t *Checks king_o *becomes rook2
rook3  *Blocks Check *becomes rook4
`.trim())

    let res = filter.filterPuzzles(puzzles, [])

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
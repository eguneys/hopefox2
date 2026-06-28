import { it, expect } from 'vitest'
import { ScriptFilter, ScriptRunner } from './runner.js'
import { DebugParser } from './types.js'
import { read_csv } from './db.js'

import fs from 'node:fs'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
let puzzles100 = puzzles.slice(0, 10)

it('basic usage', () => {

    let filter = new ScriptFilter(`
rook_t *Checks king_o *becomes rook2
rook3_t *Blocks Check *becomes rook4
rook2 *Captures rook4 *becomes rook5
      .Checks king
queen *Captures rook5 *becomes queen2
bishop *Captures queen2 *becomes bishop2
`.trim())

    let res = filter.filterPuzzles(puzzles100, new Map([['exact', _ => _.exact]]))


    expect(res.get('exact')![0].preview).toBe(`
https://lichess.org/training/01Vbe
[Rc1+ Rd1 Rxd1+ Qxd1 Bxd1]
1: {Rc1+}
2: {Rc1+ Rd1}
3: {Rc1+ Rd1 Rxd1+}
4: {Rc1+ Rd1 Rxd1+}
5: {Rc1+ Rd1 Rxd1+ Qxd1}
6: {Rc1+ Rd1 Rxd1+ Qxd1 Bxd1}
`.trim())

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



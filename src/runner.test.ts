import { it, expect } from 'vitest'
import { ScriptFilter } from './runner.js'
import { read_csv } from './db.js'

import fs from 'node:fs'
let puzzles = read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())

it('works', () => {


    let filter = new ScriptFilter(`
rook *Checks king *becomes rook2
`)

    let res = filter.filterPuzzles(puzzles, [])

})
import { it, expect } from 'vitest'
import { read_csv } from './db.js'
import * as fs from 'node:fs'



it('works', () => {
    read_csv(fs.readFileSync('data/athousand_sorted.csv').toString())
})
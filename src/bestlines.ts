import { CsvPuzzle } from "./db.js"
import { DebugMove } from "./debug.js"
import { ScriptRunner } from "./runner.js"
import { Position } from "./types.js"

export class BestLine {

    runner: Map<string, ScriptRunner>

    constructor(scripts: [string, string][]) {
        this.runner = new Map()

        for (let [name, script] of scripts)
            this.runner.set(name, ScriptRunner.parse(script))
    }

    findBestLine(position: Position) {

        for (let [name, script] of this.runner) {
            let { moves, preview } = script.runOnPosition(position)
            let lines = moves.getLinesWith([])

            if (lines.length > 0 && lines[0].length > 0) {
                return DebugMove.movesAsSans(position, lines[0])
            }
        }


    }
}
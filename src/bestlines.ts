import { CsvPuzzle } from "./db.js"
import { DebugMove } from "./debug.js"
import { ScriptRunner } from "./runner.js"
import { Move, Position } from "./types.js"

export class BestLine {

    runner: Map<string, ScriptRunner>

    constructor(scripts: [string, string][], private posets: string[][]) {
        this.runner = new Map()

        for (let [name, script] of scripts)
            this.runner.set(name, ScriptRunner.parse(script))
    }

    findBestLine(position: Position): BestLineResult {

        let result: BestLineResult = {
            bestLineScripts: [],
            bestTreeScripts: [],
        }

        for (let [name, script] of this.runner) {
            let { moves, preview } = script.runOnPosition(position)
            let lines = moves.getLinesWith([])

            lines = lines.filter(_ => _.length > 0)

            if (lines.length === 1) {
                result.bestLineScripts.push([name, lines[0]])
            }
            if (lines.length > 1) {
                result.bestTreeScripts.push(name)
            }
        }

        result.bestLineScripts.sort((a, b) => {
            let poset = this.posets.find(poset => poset.indexOf(a[0]) !== -1 && poset.indexOf(b[0]) !== -1)

            if (poset) {
                return poset.indexOf(a[0]) - poset.indexOf(b[0])
            } else {
                return 0
            }
        })


        return result
    }
}


export type BestLineResult = {
    bestLineScripts: [string, Move[]][]
    bestTreeScripts: string[]
}
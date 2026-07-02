import { CsvPuzzle } from "./db.js"
import { DebugMove } from "./debug.js"
import { ScriptRunner } from "./runner.js"
import { MoveTree } from "./tree.js"

export class AutoPoset {

    runner: Map<string, ScriptRunner>


    constructor(scripts: [string, string][]) {
        this.runner = new Map()

        for (let [name, script] of scripts)
            this.runner.set(name, ScriptRunner.parse(script))
    }

    getPoset(csv: CsvPuzzle): string[] {
        let bestTreeScripts: [string, MoveTree][] = []
        for (let [name, script] of this.runner) {
            let { moves, preview } = script.runOnPosition(csv.position)
            if (moves.size > 0)
                bestTreeScripts.push([name, moves])
        }

        const solutionSans = DebugMove.ucisAsSans(csv.position, csv.solution)
        const solutionMoves = DebugMove.ucisAsMoves(csv.position, csv.solution)

        let poset = []

        outer: for (let k = 0; k < bestTreeScripts.length; k++) {
            const bestLineScripts = bestTreeScripts[k][1].getLinesWithOpponentMoves(solutionMoves)
            if (bestLineScripts) {
                const bestLine = DebugMove.movesAsSans(csv.position, bestLineScripts[0])
                let is_mismatch = false
                for (let j = 0; j < solutionSans.length; j++) {
                    if (solutionSans[j] !== bestLine[j]) {
                        is_mismatch = true
                        break
                    }
                }

                if (is_mismatch) {
                    poset.push(bestTreeScripts[k][0])
                } else {
                    if (poset.length === 0) break
                    poset.unshift(bestTreeScripts[k][0])
                }
            }
        }

        return poset
    }


}
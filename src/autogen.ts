import { ScriptBinder, ScriptWriter } from "./binder.js";
import { Instruction, Symbol } from "./parser.js";
import { ScriptRunner } from "./runner.js";
import { Position } from "./types.js";

export class AutoGen {

    static fromScripts = (scripts: string[]) => {
        return new AutoGen(scripts)
    }

    runners: ScriptRunner[]
    private constructor(private scripts: string[]) {
        this.runners = scripts.map(_ => ScriptRunner.parse(_))
    }

    genScriptsOnPosition(position: Position) {

        const step = (depth: number, instructions: Instruction[], script_list: number[]): number[][] => {
            if (depth === 0) {
                return [script_list]
            }
            let result = []
            for (let i = 0; i < this.runners.length; i++) {

                let ilist = ScriptBinder.bindInstructions(instructions, this.runners[i].instructions)
                for (let list of ilist) {
                    let runner = ScriptRunner.fromList(list)
                    let { moves } = runner.runOnPosition(position)
                    let matched_lines = moves.getLinesWith([]).filter(_ => _.length > 0)

                    if (matched_lines.length > 0) {
                        result.push(...step(depth - 1, runner.instructions, [...script_list, i]))
                    }
                }
            }
            if (result.length === 0) {
                return [script_list]
            }
            return result
        }

        let result = []
        let lists = step(4, [], [])

        let indexes = []
        for (let list of lists) {
            let m = list.reduce((a, b) => a.flatMap(aa => ScriptBinder.bindInstructions(aa, this.runners[b].instructions)), ScriptBinder.bindInstructions([], []))
            for (let mm of m) {
                result.push(ScriptWriter.write(mm))
                indexes.push(list)
            }
        }
        return { lists: result, indexes }
    }


}
import { CsvPuzzle } from "./db.js";
import { Position } from "./types.js";

class ScriptRunner {

    static parse(script: string) {
        return new ScriptRunner()
    }

    runOnPosition(position: Position) {

        let moves: string[] = []
        let preview = ''

        return { moves, preview }
    }
}

class Bucket {

    negative!: boolean
    shorter!: boolean
    longer!: boolean
    exact_length!: boolean
    exact_first_move!: boolean
    exact_second_move!: boolean
    moves_diverge_at?: number
    solution_diverge_at?: number


    get exact_moves() {
        return this.moves_diverge_at === undefined
    }

    get exact_solution() {
        return this.solution_diverge_at === undefined
    }

    get exact() {
        return this.exact_moves && this.exact_solution
    }

    constructor(public preview: string) { }
}

export class ScriptFilter {

    runner: ScriptRunner

    constructor(script: string) {
        this.runner = ScriptRunner.parse(script)
    }

    private runOnPuzzle(pos: CsvPuzzle) {

        let { moves, preview } = this.runner.runOnPosition(pos.position)

        let result = new Bucket(preview)

        if (moves.length === 0) {
            result.negative = true
        }

        if (moves.length < pos.solution.length) {
            result.shorter = true
        } else if (moves.length > pos.solution.length) {
            result.longer = true
        } else {
            result.exact_length = true
        }


        if (moves[0] !== undefined && moves[0] === pos.solution[0]) {
            result.exact_first_move = true
        }
        if (moves[1] !== undefined && moves[1] === pos.solution[1]) {
            result.exact_second_move = true
        }



        for (let i = 0; i < pos.solution.length; i++) {
            if (moves[i] === pos.solution[i]) {
                continue
            }

            if (moves[i] !== undefined) {
                result.moves_diverge_at = i
                break
            }
        }

        for (let i = 0; i < moves.length; i++) {
            if (moves[i] === pos.solution[i]) {
                continue
            }

            if (pos.solution[i] !== undefined) {
                result.solution_diverge_at = i
                break
            }
        }

        return result
    }

    filterPuzzles(csv: CsvPuzzle[], filters: Filter[]) {
        let buckets = new Buckets()

        for (let pos of csv) {
            buckets.add(this.runOnPuzzle(pos))
        }

        return buckets.filter(filters)
    }
}

export type Filter = (_: Bucket) => boolean

class Buckets {

    buckets: Bucket[] = []

    add(bucket: Bucket) {
        this.buckets.push(bucket)
    }


    filter(filters: Filter[]) {
        return this.buckets.filter(_ => filters.every(f => f(_)))
    }
}
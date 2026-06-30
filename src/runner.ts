import { CsvPuzzle } from "./db.js";
import { DebugMove } from "./debug.js";
import { History, Tree, Slice, Table } from "./history.js";
import { matchInstruction } from "./matchers.js";
import { Instruction, Parser } from "./parser.js";
import { Debug, Position } from "./types.js";

export class ScriptRunner {

    history: History

    private constructor(instructions: Instruction[]) {
        this.history = new History(instructions)
    }

    static parse(script: string) {
        let parser = new Parser(script)
        return new ScriptRunner(parser.parse())
    }

    runOnPosition(position: Position) {

        this.history.resetPosition(position)

        let slices: Slice[] = [{ off: 0, len: 1 }]

        for (let ins of this.history.program) {
            let lastSlice = slices[slices.length - 1]!
            let off = this.history.nodes.length
            matchInstruction(ins, this.history, lastSlice)
            let len = this.history.nodes.length - off
            slices.push({ off, len })
        }

        let preview = ''

        let i = 1
        for (let slice of slices.slice(1)) {
            let movesSlice = this.history.getSlice(slice)

            if (i > 1) preview += '\n'
            preview += `${i++}: `
            for (let moves2 of movesSlice) {
                preview += `{${DebugMove.movesAsSans(this.history.position, moves2).join(' ')}}`
            }

        }

        let movesSlice = this.history.getSlice(slices[slices.length - 1])
        let moves = DebugMove.movesAsUcis(this.history.position, movesSlice[0] ?? [])

        return { moves, preview }
    }
}

export class Bucket {


    negative!: boolean
    shorter!: boolean
    longer!: boolean
    exact_length!: boolean
    exact_first_move!: boolean
    exact_second_move!: boolean
    moves_diverge_at?: number
    solution_diverge_at?: number


    get exact_moves() {
        if (this.shorter || !this.exact_length) {
            return false
        }
        return this.moves_diverge_at === undefined
    }

    get exact_solution() {
        if (this.longer || !this.exact_length) {
            return false
        }
        return this.solution_diverge_at === undefined
    }

    get exact() {
        return this.exact_moves && this.exact_solution
    }

    constructor(public preview: string, public csv_puzzle: CsvPuzzle) { }
}

export class ScriptFilter {

    runner: ScriptRunner

    constructor(script: string) {
        this.runner = ScriptRunner.parse(script)
    }

    private runOnPuzzle(pos: CsvPuzzle) {

        let { moves, preview } = this.runner.runOnPosition(pos.position)

        let fullPreview = ''

        fullPreview += `${pos.index} https://lichess.org/training/${pos.id}\n`
        fullPreview += `[${DebugMove.ucisAsSans(pos.position, pos.solution).join(' ')}]\n`

        fullPreview += preview

        let result = new Bucket(fullPreview, pos)

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

    filterPuzzles(csv: CsvPuzzle[], filters: Map<string, Filter>) {
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


    filter(filters: Map<string, Filter>) {
        let result = new Map<string, Bucket[]>


        for (let [key, filter] of filters) {
            result.set(key, this.buckets.filter(_ => filter(_)))
        }

        return result
    }
}
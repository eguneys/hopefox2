import { fix_symbol_checks_to_check } from "./matchers.js";
import { Symbol, Instruction } from "./parser.js";
import { Bitboard, Move, Position } from "./types.js";

export class Table {

    symbols: Map<string, Bitboard[]>

    static fromSymbols = (symbols: Symbol[]) => {
        let result = new Table()

        for (let symbol of symbols) {
            result.addColumn(fix_symbol_checks_to_check(symbol))
        }
        result.addZeroRow()
        return result
    }

    private constructor() {
        this.symbols = new Map()
    }

    addColumn(key: Symbol) {
        let hash = `${key.name}${key.id}`
        this.symbols.set(hash, [])
    }

    private addZeroRow() {
        for (let column of this.symbols.values()) {
            column.push(Bitboard.Full)
        }
    }

    duplicateRow(row: number) {
        for (let column of this.symbols.values()) {
            column.push(column[row]!)
        }
    }

    setLastRow(key: Symbol, value: Bitboard) {
        let column = this.getColumn(key)
        column[column.length - 1] = value
    }

    clearRows() {
        for (let column of this.symbols.values()) {
            column.length = 0
        }

        this.addZeroRow()
    }

    getColumn(key: Symbol) {
        let hash = `${key.name}${key.id}`
        return this.symbols.get(hash)!
    }
}

type Node = {
    parent: number
    value: Move
    children: Slice
}

export class Tree {

    flat: Node[]
    appending = 0


    constructor() {
        this.flat = [{ parent: 0, value: Move.None, children: { off: 1, len: 0 } }]
    }

    getNode(off: number) {
        return this.flat[off]
    }


    clear() {
        this.flat = [{ parent: 0, value: Move.None, children: { off: 1, len: 0 } }]
        this.appending = 0
    }

    appendChild(off: number, value: Move) {
        this.flat.push({ parent: off, value, children: { off: 0, len: 0 } })

        if (off !== this.appending) {
            this.appending = off
            if (this.flat[this.appending].children.len === 0) {
                this.flat[this.appending].children.off = this.flat.length - 1
            }
        }

        this.flat[off].children.len += 1
        return this.flat.length - 1
    }


    getHistory(off: number): Move[] {
        let result = []
        var parent = off
        while (parent !== 0) {
            result.push(this.getNode(parent).value)
            parent = this.getNode(parent).parent
        }
        return result.reverse()
    }

    get length() {
        return this.flat.length
    }
}

export type Slice = { off: number, len: number }
export class History {
    table: Table
    nodes: Tree
    position!: Position

    constructor(readonly program: Instruction[]) {
        this.nodes = new Tree()

        let symbols = program.flatMap(ins => {
            let result = []
            result.push(ins.from.symbol!)
            result.push(ins.to.symbol!)
            result.push(ins.action.symbol!)
            if (ins.and) result.push(ins.and.symbol!)
            if (ins.becomes) result.push(ins.becomes.symbol!)
            return result
        })

        this.table = Table.fromSymbols(symbols)

    }

    resetPosition(position: Position) {
        this.position = position
        this.table.clearRows()
        this.nodes.clear()
    }

    getSlice(slice: Slice) {
        let result = []
        for (let off = slice.off; off < slice.off + slice.len; off++) {
            let moves = this.nodes.getHistory(off)
            result.push(moves)
        }
        return result
    }

    getPositionOf(off: number) {
        let result = Position.clone(this.position)
        for (let move of this.nodes.getHistory(off)) {
            if (!move.isNone()) {
                result.makeMove(move)
            }
        }
        return result
    }
}


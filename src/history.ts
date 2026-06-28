import { Symbol, Instruction } from "./parser.js";
import { Bitboard, Move, Position } from "./types.js";

export class Table {

    symbols: Map<string, Bitboard[]>

    constructor() {
        this.symbols = new Map()
        this.addZeroRow()
    }


    private addZeroRow() {
        for (let column of this.symbols.values()) {
            column.push(Bitboard.Zero)
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


export class Nodes {

    moves: Move[]

    constructor() {
        this.moves = []
    }

    get length() {
        return this.moves.length
    }

    clear() {

    }

    getHistoryOf(off: number) {
        let res: Move[] = []

        return res
    }
}

export type Slice = { off: number, len: number }
export class History {
    table: Table
    nodes: Nodes
    position!: Position

    constructor(readonly program: Instruction[]) {
        this.table = new Table()
        this.nodes = new Nodes()
    }

    resetPosition(position: Position) {
        this.position = position
        this.table.clearRows()
        this.nodes.clear()
    }

    getSlice(slice: Slice) {
        let result = []
        for (let off = slice.off; off < slice.off + slice.len; off++) {
            let moves = this.nodes.getHistoryOf(off)
            result.push(moves)
        }
        return result
    }

    getPositionOf(off: number) {
        let result = Position.clone(this.position)
        for (let move of this.nodes.getHistoryOf(off)) {
            if (!move.isNone()) {
                result.makeMove(move)
            }
        }
        return result
    }
}


import { Instruction, Symbol } from "./parser.js";
import { History, Slice } from './history.js'
import { Bitboard, Debug, Move, Position, Square } from "./types.js";
import * as log from './logs.js'
import * as Attacks from './attacks.js'

class MatchFilters {
    static checks = (ins: Instruction, history: History, slice: Slice) => {
        const From = history.table.getColumn(ins.from.symbol!)
        const To = history.table.getColumn(ins.to.symbol!)
    }
}

class MatchActions {
    static checks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const checked_symbol = ins.to.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const Checked = history.table.getColumn(checked_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_checked = Checked[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_checked2 = bb_checked.bitand(SymbolBitboard.square(position, checked_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                for (let sq_to of aa_to) {

                    const aa_checked = SymbolBitboard.movesTo(position, from_symbol, sq_to)

                    const bb_checked3 = bb_checked2.bitand(aa_checked)

                    for (let sq_checked of bb_checked3) {

                        history.table.duplicateRow(off)

                        history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                        history.table.setLastRow(checked_symbol, Bitboard.fromSquare(sq_checked))
                        history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))


                        let move = Move.normal(sq_from, sq_to)
                        history.nodes.appendChild(off, move)
                    }
                }
            }


        }

    }
}

class SymbolBitboard {


    static movesTo = (position: Position, from_symbol: Symbol, sq_from: Square) => {
        var result = Bitboard.Zero
        switch (from_symbol.name) {
            case 'pawn': {
                break
            }
            case 'knight': {
                break
            }
            case 'king': {
                break
            }
            case 'bishop':
            case 'rook':
            case 'queen': {
                result = Attacks.pieceRayHit(sq_from, position.occupied(), from_symbol.name)
                break
            }
        }

        return result
    }

    static square = (position: Position, symbol: Symbol) => {
        let result!: Bitboard
        switch (symbol.name) {
            case 'pawn': {
                result = position.bb_pawn
                break
            }
            case 'bishop': {
                result = position.bb_bishop
                break
            }
            case 'rook': {
                result = position.bb_rook
                break
            }
            case 'knight': {
                result = position.bb_knight
                break
            }
            case 'queen': {
                result = position.bb_queen
                break
            }
            case 'king': {
                result = position.bb_king
                break
            }
            default: {
                result = position.bb_vacant()
            }
        }

        if (symbol.props.includes('_t')) {
            result = result.bitand(position.bb_turn())
        } else if (symbol.props.includes('_o')) {
            result = result.bitand(position.bb_opponent())
        }

        return result
    }
}

export function matchInstruction(ins: Instruction, history: History, slice: Slice) {
    switch (ins.action.symbol!.name) {
        case 'Checks': {
            if (ins.becomes) {
                MatchActions.checks(ins, history, slice)
            } else {
                MatchFilters.checks(ins, history, slice)
            }
        }
    }
}

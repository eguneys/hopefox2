import { Instruction, Symbol } from "./parser.js";
import { History, Slice } from './history.js'
import { Bitboard, Debug, Move, Position, Square } from "./types.js";
import * as log from './logs.js'
import * as Attacks from './attacks.js'

class MatchFilters {
    static checks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Check_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const checked_symbol = ins.to.symbol!
        const From = history.table.getColumn(from_symbol)
        const Checked = history.table.getColumn(checked_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_checked = Checked[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_checked2 = bb_checked.bitand(SymbolBitboard.square(position, checked_symbol))

            for (let sq_from of bb_from2) {
                const aa_checked = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                const bb_checked3 = bb_checked2.bitand(aa_checked)

                for (let sq_checked of bb_checked3) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(checked_symbol, Bitboard.fromSquare(sq_checked))
                    history.table.setLastRow(Check_symbol, Attacks.rayBetweenFromTo(sq_from, sq_checked))

                    history.nodes.appendChild(off, Move.None)
                }
            }
        }

    }
}

class MatchActions {

    static captures = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const captured_symbol = ins.to.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const Captured = history.table.getColumn(captured_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_captured = Captured[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_captured2 = bb_captured.bitand(SymbolBitboard.square(position, captured_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                const bb_to2 = bb_captured2.bitand(aa_to)


                for (let sq_to of bb_to2) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(captured_symbol, Bitboard.fromSquare(sq_to))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.normal(sq_from, sq_to)
                    history.nodes.appendChild(off, move)
                }
            }
        }
    }


    static blocks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const check_symbol = ins.to.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const Check = history.table.getColumn(check_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_check = Check[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)
                const bb_block = bb_check.bitand(aa_to)

                for (let sq_block of bb_block) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_block))

                    let move = Move.normal(sq_from, sq_block)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }


    static evadesTo = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const To = history.table.getColumn(to_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_to = To[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                let bb_to3 = aa_to.bitand(bb_to2)

                for (let sq_to of bb_to3) {
                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(to_symbol, Bitboard.fromSquare(sq_to))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.normal(sq_from, sq_to)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }

    static forks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Fork_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const forkedA_symbol = ins.to.symbol!
        const forkedB_symbol = ins.and!.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const ForkedA = history.table.getColumn(forkedA_symbol)
        const ForkedB = history.table.getColumn(forkedB_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_forkedA = ForkedA[off]
            const bb_forkedB = ForkedB[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_forkedA2 = bb_forkedA.bitand(SymbolBitboard.square(position, forkedA_symbol))
            const bb_forkedB2 = bb_forkedB.bitand(SymbolBitboard.square(position, forkedB_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)
                const bb_to = aa_to

                for (let sq_to of bb_to) {

                    const aa_fork = SymbolBitboard.movesTo(position, from_symbol, sq_to)

                    let bb_forkedA3 = aa_fork.bitand(bb_forkedA2)
                    let bb_forkedB3 = aa_fork.bitand(bb_forkedB2)

                    for (let sq_forkedA of bb_forkedA3) {
                        for (let sq_forkedB of bb_forkedB3) {

                            history.table.duplicateRow(off)

                            history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                            history.table.setLastRow(forkedA_symbol, Bitboard.fromSquare(sq_forkedA))
                            history.table.setLastRow(forkedB_symbol, Bitboard.fromSquare(sq_forkedB))
                            history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))
                            //history.table.setLastRow(Check_symbol, Attacks.rayBetweenFromTo(sq_to, sq_checked))

                            let move = Move.normal(sq_from, sq_to)
                            history.nodes.appendChild(off, move)
                        }
                    }
                }
            }


        }

    }



    static checks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Check_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
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
                        history.table.setLastRow(Check_symbol, Attacks.rayBetweenFromTo(sq_to, sq_checked))

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
                result =
                    Attacks.knightMovesPlus(sq_from, 'up2')
                        .bitor(Attacks.knightMovesPlus(sq_from, 'down2'))
                        .bitor(Attacks.knightMovesPlus(sq_from, 'left2'))
                        .bitor(Attacks.knightMovesPlus(sq_from, 'right2'))
                break
            }
            case 'king': {
                result = Attacks.kingMovesAll(sq_from)
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

        if (symbol.props.includes('t')) {
            result = result.bitand(position.bb_turn())
        } else if (symbol.props.includes('o')) {
            result = result.bitand(position.bb_opponent())
        }

        return result
    }
}

export function matchInstruction(ins: Instruction, history: History, slice: Slice) {
    switch (ins.action.symbol!.name) {
        case 'EvadesTo': {
            if (ins.becomes) {
                MatchActions.evadesTo(ins, history, slice)
            }
        } break
        case 'Forks': {
            if (ins.becomes) {
                MatchActions.forks(ins, history, slice)
            } else {
                //MatchFilters.checks(ins, history, slice)
            }
        } break
        case 'Checks': {
            if (ins.becomes) {
                MatchActions.checks(ins, history, slice)
            } else {
                MatchFilters.checks(ins, history, slice)
            }
        } break
        case 'Blocks': {
            if (ins.becomes) {
                MatchActions.blocks(ins, history, slice)
            }
        } break
        case 'Captures': {
            if (ins.becomes) {
                MatchActions.captures(ins, history, slice)
            }
        }
    }
}


export function fix_symbol_checks_to_check(Checks: Symbol): Symbol {
    if (Checks.name === 'Checks') {
        return {
            id: Checks.id,
            name: 'Check',
            props: Checks.props
        }
    }
    return Checks
}
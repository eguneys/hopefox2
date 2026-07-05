import { Instruction, Symbol } from "./parser.js";
import { History, Slice } from './history.js'
import { Bitboard, Debug, king_distance, Move, opposite, Position, Square } from "./types.js";
import * as log from './logs.js'
import * as Attacks from './attacks.js'
import * as Pawns from './pawns.js'

class MatchFilters {


    static hanging = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const white_defends = Attacks.allAttacksOfColor(position, 'white')
            const black_defends = Attacks.allAttacksOfColor(position, 'black')

            for (let sq_from of bb_from2) {
                const bb_defends = position.getColor(sq_from) === 'white' ? white_defends : black_defends

                if (!bb_defends.has(sq_from)) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))

                    history.nodes.appendChild(off, Move.None)
                }
            }
        }

    }



    static isUnblockableFor = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)
        const to_symbol = ins.to!.symbol!
        const To = history.table.getColumn(to_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const bb_to = To[off]
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))

            for (let sq_from of bb_from2) {
                for (let sq_for of bb_to2) {
                    const attack = Attacks.rayBetweenFromTo(sq_from, sq_for)
                    const blocks = Attacks.allBlocksOfColorWithout(position, position.turn, sq_for)

                    if (blocks.bitand(attack).isEmpty()) {
                        history.table.duplicateRow(off)
                        history.nodes.appendChild(off, Move.None)
                    }
                }
            }
        }

    }

    static noSafeEvadeableFor = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)
        const to_symbol = ins.to!.symbol!
        const To = history.table.getColumn(to_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const bb_to = To[off]
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))

            for (let sq_from of bb_from2) {

                const bb_support2 = position.bb_color(position.getColor(sq_from))

                let aa_support = Bitboard.Zero

                for (let sq_support of bb_support2) {

                    for (let sq_for of bb_to2) {
                        let attack = Attacks.supportsFor(position, sq_support, sq_for, position.roleOn(sq_support)!)
                        aa_support = aa_support.bitor(attack)
                    }

                }


                for (let sq_for of bb_to2) {
                    const evades = SymbolBitboard.movesTo(position, to_symbol, sq_for)
                    const evades2 = evades.bitdiff(position.bb_color(position.getColor(sq_for)))

                    if (evades2.bitdiff(aa_support).isEmpty()) {
                        history.table.duplicateRow(off)
                        history.nodes.appendChild(off, Move.None)
                    }
                }
            }
        }

    }


    static noSafeCapturable = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const white_captures = Attacks.allAttacksOfColorWithoutKing(position, 'white')
            const black_captures = Attacks.allAttacksOfColorWithoutKing(position, 'black')

            for (let sq_from of bb_from2) {
                const bb_captures = position.getColor(sq_from) === 'white' ? black_captures : white_captures

                if (!bb_captures.has(sq_from)) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))

                    history.nodes.appendChild(off, Move.None)
                }
            }
        }

    }






    static onSupportedKingZone = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)
        const to_symbol = ins.to!.symbol!
        const To = history.table.getColumn(to_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const bb_to = To[off]
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))

            const white_king = position.bb_king.bitand(position.bb_color('white'))
            const black_king = position.bb_king.bitand(position.bb_color('black'))

            const white_zone = Attacks.kingMovesAll(white_king.single()!)
            const black_zone = Attacks.kingMovesAll(black_king.single()!)

            for (let sq_from of bb_from2) {

                for (let sq_support of bb_to2) {

                    const aa_support = SymbolBitboard.supportsFor(position, to_symbol, sq_support)


                    const king_zone = position.getColor(sq_from) === 'white' ? black_zone : white_zone

                    if (king_zone.bitand(aa_support).has(sq_from)) {
                        history.table.duplicateRow(off)

                        history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                        history.table.setLastRow(to_symbol, Bitboard.fromSquare(sq_support))

                        history.nodes.appendChild(off, Move.None)
                    }

                }
            }
        }

    }




    static isUnevadeableFor = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)
        const to_symbol = ins.to!.symbol!
        const To = history.table.getColumn(to_symbol)
        const support_symbol = ins.and?.symbol
        const Support = support_symbol ? history.table.getColumn(support_symbol) : undefined

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const bb_to = To[off]
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))

            const bb_support = Support?.[off]
            const bb_support2 = support_symbol ? bb_support!.bitand(SymbolBitboard.square(position, support_symbol)) : undefined

            let aa_support = Bitboard.Zero

            if (bb_support2) {
                for (let sq_support of bb_support2) {

                    for (let sq_for of bb_to2) {
                        let attack = SymbolBitboard.supportsForThrough(position, support_symbol!, sq_support, sq_for)
                        aa_support = aa_support.bitor(attack)
                    }

                }
            }

            for (let sq_from of bb_from2) {

                for (let sq_for of bb_to2) {
                    let attack = SymbolBitboard.movesThrough(position, from_symbol, sq_from, sq_for)
                    const evades = SymbolBitboard.movesTo(position, to_symbol, sq_for)
                    const evades2 = evades.bitdiff(position.bb_color(position.getColor(sq_for)))

                    let attack2 = attack.bitor(aa_support)

                    if (evades2.bitdiff(attack2).isEmpty()) {
                        history.table.duplicateRow(off)
                        history.nodes.appendChild(off, Move.None)
                    }
                }
            }
        }

    }






    static onlyDefendedBy = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
        const From = history.table.getColumn(from_symbol)
        const To = history.table.getColumn(to_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const bb_to = To[off]
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))


            for (let sq_from of bb_from2) {

                const bb_defends = Attacks.allDefendersOf(position, sq_from)
                const only_defend = bb_defends.single()

                if (only_defend !== undefined && bb_to2.has(only_defend)) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(to_symbol, Bitboard.fromSquare(only_defend))

                    history.nodes.appendChild(off, Move.None)
                }
            }
        }

    }




    static notAttacked = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const From = history.table.getColumn(from_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            const white_attacks = Attacks.allAttacksOfColor(position, 'white')
            const black_attacks = Attacks.allAttacksOfColor(position, 'black')

            for (let sq_from of bb_from2) {
                const bb_attacks = position.getColor(sq_from) === 'black' ? white_attacks : black_attacks

                if (!bb_attacks.has(sq_from)) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))

                    history.nodes.appendChild(off, Move.None)
                }
            }
        }

    }


    static eyesThrough = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
        const through_symbol = ins.and!.symbol!
        const From = history.table.getColumn(from_symbol)
        const To = history.table.getColumn(to_symbol)
        const Through = history.table.getColumn(through_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_to = To[off]
            const bb_through = Through[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))
            const bb_through2 = bb_through.bitand(SymbolBitboard.square(position, through_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                const bb_through3 = aa_to.bitand(bb_through2)

                for (let sq_through of bb_through3) {
                    const aa_through = SymbolBitboard.movesThrough(position, from_symbol, sq_from, sq_through).without(sq_through)

                    const aa_through2 = aa_through.bitdiff(aa_to)

                    const aa_through2_to = aa_through2.bitand(bb_to2)

                    for (let sq_to of aa_through2_to) {

                        history.table.duplicateRow(off)

                        history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                        history.table.setLastRow(to_symbol, Bitboard.fromSquare(sq_to))
                        history.table.setLastRow(through_symbol, Bitboard.fromSquare(sq_through))

                        history.nodes.appendChild(off, Move.None)
                    }
                }
            }

        }
    }


    static defends = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Defend_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const defended_symbol = ins.to!.symbol!
        const From = history.table.getColumn(from_symbol)
        const Defended = history.table.getColumn(defended_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_defended = Defended[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_defended2 = bb_defended.bitand(SymbolBitboard.square(position, defended_symbol))

            for (let sq_from of bb_from2) {
                const aa_defended = SymbolBitboard.captures(position, from_symbol, sq_from)

                const bb_defended3 = bb_defended2.bitand(aa_defended)

                for (let sq_defended of bb_defended3) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(defended_symbol, Bitboard.fromSquare(sq_defended))
                    history.table.setLastRow(Defend_symbol, Attacks.rayBetweenFromTo(sq_from, sq_defended))

                    history.nodes.appendChild(off, Move.None)
                }
            }
        }

    }




    static checks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Check_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const checked_symbol = ins.to!.symbol!
        const From = history.table.getColumn(from_symbol)
        const Checked = history.table.getColumn(checked_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_checked = Checked[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_checked2 = bb_checked.bitand(SymbolBitboard.square(position, checked_symbol))

            for (let sq_from of bb_from2) {
                const aa_checked = SymbolBitboard.captures(position, from_symbol, sq_from)

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



    static forks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Fork_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const forkedA_symbol = ins.to!.symbol!
        const forkedB_symbol = ins.and!.symbol!
        const From = history.table.getColumn(from_symbol)
        const ForkedA = history.table.getColumn(forkedA_symbol)
        const ForkedB = history.table.getColumn(forkedB_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_forkedA = ForkedA[off]
            const bb_forkedB = ForkedB[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_forkedA2 = bb_forkedA.bitand(SymbolBitboard.square(position, forkedA_symbol))
            const bb_forkedB2 = bb_forkedB.bitand(SymbolBitboard.square(position, forkedB_symbol))

            for (let sq_from of bb_from2) {
                const aa_fork = SymbolBitboard.captures(position, from_symbol, sq_from)

                let bb_forkedA3 = aa_fork.bitand(bb_forkedA2)
                let bb_forkedB3 = aa_fork.bitand(bb_forkedB2)

                for (let sq_forkedA of bb_forkedA3) {
                    for (let sq_forkedB of bb_forkedB3) {

                        history.table.duplicateRow(off)

                        history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                        history.table.setLastRow(forkedA_symbol, Bitboard.fromSquare(sq_forkedA))
                        history.table.setLastRow(forkedB_symbol, Bitboard.fromSquare(sq_forkedB))
                        //history.table.setLastRow(Check_symbol, Attacks.rayBetweenFromTo(sq_to, sq_checked))

                        let move = Move.None
                        history.nodes.appendChild(off, move)
                    }
                }

            }

        }
    }
}

class MatchActions {

    static captures = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const captured_symbol = ins.to!.symbol!
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
                const aa_to = SymbolBitboard.captures(position, from_symbol, sq_from)

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


    static castles_long_to = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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

                const aa_to = Attacks.kingCastlesLong(sq_from)
                const bb_to3 = bb_to2.bitand(aa_to)

                for (let sq_to of bb_to3) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.castling(sq_from, sq_to)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }



    static capture_promotes = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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
                let aa_to = SymbolBitboard.captures(position, from_symbol, sq_from)

                const promotion_rank = position.getColor(sq_from) === 'white' ? Bitboard.Rank8 : Bitboard.Rank1
                const bb_to3 = bb_to2.bitand(promotion_rank)

                aa_to = aa_to.bitand(bb_to3)


                for (let sq_to of aa_to) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.promotion(sq_from, sq_to, becomes_symbol.name)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }



    static push_promotes = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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
                let aa_to = SymbolBitboard.pushes(position, from_symbol, sq_from)

                const promotion_rank = position.getColor(sq_from) === 'white' ? Bitboard.Rank8 : Bitboard.Rank1
                const bb_to3 = bb_to2.bitand(promotion_rank)

                aa_to = aa_to.bitand(bb_to3)


                for (let sq_to of aa_to) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.promotion(sq_from, sq_to, becomes_symbol.name)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }


    static double_pushes = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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
                let aa_to = SymbolBitboard.double_pushes(position, from_symbol, sq_from)

                aa_to = aa_to.bitand(bb_to2)

                for (let sq_to of aa_to) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.normal(sq_from, sq_to)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }

    static pushes = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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
                let aa_to = SymbolBitboard.pushes(position, from_symbol, sq_from)

                aa_to = aa_to.bitand(bb_to2)

                for (let sq_to of aa_to) {

                    history.table.duplicateRow(off)

                    history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                    history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))

                    let move = Move.normal(sq_from, sq_to)
                    history.nodes.appendChild(off, move)
                }
            }
        }


    }




    static push_blocks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const check_symbol = ins.to!.symbol!
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
                const aa_to = SymbolBitboard.pushes(position, from_symbol, sq_from)
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



    static blocks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const check_symbol = ins.to!.symbol!
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


    static approaches = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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

                for (let sq_approachTo of bb_to2) {

                    let distanceFrom = king_distance(sq_from, sq_approachTo)

                    for (let sq_to of aa_to) {

                        let distanceTo = king_distance(sq_to, sq_approachTo)

                        if (distanceTo < distanceFrom) {

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
        }
    }



    static movesTo = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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


    static singleSafeEvadeTo = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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


                const bb_covered = position.bb_color(opposite(position.getColor(sq_from)))

                let aa_covered = Bitboard.Zero

                for (let sq_covered of bb_covered) {
                    let cover = Attacks.supportsFor(position, sq_covered, sq_from, position.roleOn(sq_covered)!)
                    aa_covered = aa_covered.bitor(cover)
                }



                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                let bb_to3 = aa_to.bitand(bb_to2)
                bb_to3 = bb_to3.bitdiff(aa_covered)

                let sq_to = bb_to3.single()
                if (sq_to !== undefined) {
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



    static evadesTo = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const to_symbol = ins.to!.symbol!
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


    static eyesThrough = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const through_symbol = ins.to!.symbol!
        const to_symbol = ins.and!.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const To = history.table.getColumn(to_symbol)
        const Through = history.table.getColumn(through_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_to = To[off]
            const bb_through = Through[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))
            const bb_through2 = bb_through.bitand(SymbolBitboard.square(position, through_symbol))


            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                for (let sq_from2 of aa_to) {
                    const aa_to2 = SymbolBitboard.movesTo(position, from_symbol, sq_from2)

                    const bb_through3 = aa_to2.bitand(bb_through2)

                    for (let sq_through of bb_through3) {
                        const aa_through = SymbolBitboard.movesThrough(position, from_symbol, sq_from2, sq_through).without(sq_through)

                        const aa_through2 = aa_through.bitdiff(aa_to2)

                        const aa_through2_to = aa_through2.bitand(bb_to2)

                        for (let sq_to of aa_through2_to) {

                            history.table.duplicateRow(off)

                            history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                            history.table.setLastRow(to_symbol, Bitboard.fromSquare(sq_to))
                            history.table.setLastRow(through_symbol, Bitboard.fromSquare(sq_through))
                            history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_from2))

                            let move = Move.normal(sq_from, sq_from2)
                            history.nodes.appendChild(off, move)
                        }
                    }
                }
            }

        }
    }



    static unpins = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const unpinA_symbol = ins.to!.symbol!
        const unpinB_symbol = ins.and!.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const UnpinA = history.table.getColumn(unpinA_symbol)
        const UnpinB = history.table.getColumn(unpinB_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_unpinA = UnpinA[off]
            const bb_unpinB = UnpinB[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))

            for (let sq_unpinA of bb_unpinA) {
                for (let sq_unpinB of bb_unpinB) {

                    const bb_unpin = Attacks.rayBetweenFromTo(sq_unpinA, sq_unpinB)
                    for (let sq_from of bb_from2) {
                        const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)
                        const bb_block = bb_unpin.bitand(aa_to)

                        for (let sq_block of bb_block) {

                            history.table.duplicateRow(off)

                            history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                            history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_block))
                            history.table.setLastRow(unpinA_symbol, Bitboard.fromSquare(sq_unpinA))
                            history.table.setLastRow(unpinB_symbol, Bitboard.fromSquare(sq_unpinB))

                            let move = Move.normal(sq_from, sq_block)
                            history.nodes.appendChild(off, move)
                        }
                    }
                }
            }
        }
    }



    static pins = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const through_symbol = ins.to!.symbol!
        const to_symbol = ins.and!.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const To = history.table.getColumn(to_symbol)
        const Through = history.table.getColumn(through_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_to = To[off]
            const bb_through = Through[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_to2 = bb_to.bitand(SymbolBitboard.square(position, to_symbol))
            const bb_through2 = bb_through.bitand(SymbolBitboard.square(position, through_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                for (let sq_from2 of aa_to) {
                    const aa_to2 = SymbolBitboard.movesTo(position, from_symbol, sq_from2)

                    const bb_through3 = aa_to2.bitand(bb_through2)

                    for (let sq_through of bb_through3) {
                        const aa_through = SymbolBitboard.movesThrough(position, from_symbol, sq_from2, sq_through).without(sq_through)

                        const aa_through2 = aa_through.bitdiff(aa_to)

                        const aa_through2_to = aa_through2.bitand(bb_to2)

                        for (let sq_to of aa_through2_to) {

                            history.table.duplicateRow(off)

                            history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                            history.table.setLastRow(to_symbol, Bitboard.fromSquare(sq_to))
                            history.table.setLastRow(through_symbol, Bitboard.fromSquare(sq_through))
                            history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_from2))


                            let move = Move.normal(sq_from, sq_from2)
                            history.nodes.appendChild(off, move)
                        }
                    }
                }
            }

        }
    }



    static forks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Fork_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const forkedA_symbol = ins.to!.symbol!
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

                    const aa_fork = SymbolBitboard.captures(position, from_symbol, sq_to)

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



    static defends = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Defends_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const defended_symbol = ins.to!.symbol!
        const becomes_symbol = ins.becomes!.symbol!
        const From = history.table.getColumn(from_symbol)
        const Defended = history.table.getColumn(defended_symbol)
        const Becomes = history.table.getColumn(becomes_symbol)

        for (let off = slice.off; off < slice.off + slice.len; off++) {

            const position = history.getPositionOf(off)

            const bb_from = From[off]
            const bb_defended = Defended[off]

            const bb_from2 = bb_from.bitand(SymbolBitboard.square(position, from_symbol))
            const bb_defended2 = bb_defended.bitand(SymbolBitboard.square(position, defended_symbol))

            for (let sq_from of bb_from2) {
                const aa_to = SymbolBitboard.movesTo(position, from_symbol, sq_from)

                for (let sq_to of aa_to) {

                    const aa_defended = SymbolBitboard.movesTo(position, from_symbol, sq_to)

                    const bb_defended3 = bb_defended2.bitand(aa_defended)

                    for (let sq_defended of bb_defended3) {

                        history.table.duplicateRow(off)

                        history.table.setLastRow(from_symbol, Bitboard.fromSquare(sq_from))
                        history.table.setLastRow(defended_symbol, Bitboard.fromSquare(sq_defended))
                        history.table.setLastRow(becomes_symbol, Bitboard.fromSquare(sq_to))
                        history.table.setLastRow(Defends_symbol, Attacks.rayBetweenFromTo(sq_to, sq_defended))

                        let move = Move.normal(sq_from, sq_to)
                        history.nodes.appendChild(off, move)
                    }
                }
            }


        }

    }


    static checks = (ins: Instruction, history: History, slice: Slice) => {
        const from_symbol = ins.from.symbol!
        const Check_symbol = fix_symbol_checks_to_check(ins.action.symbol!)
        const checked_symbol = ins.to!.symbol!
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

    static supportsFor = (position: Position, from_symbol: Symbol, sq_from: Square) => {
        var result = Bitboard.Zero
        switch (from_symbol.name) {
            case 'pawn': {
                result = Attacks.pawnCapturesColor(sq_from, `${position.getColor(sq_from)}`)
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



    static supportsForThrough = (position: Position, from_symbol: Symbol, sq_from: Square, sq_through: Square) => {
        var result = Bitboard.Zero
        switch (from_symbol.name) {
            case 'pawn': {
                result = Attacks.pawnCapturesColor(sq_from, `${position.getColor(sq_from)}`)
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
                result = Attacks.pieceRayHit(sq_from, position.occupied().without(sq_through), from_symbol.name)
                break
            }
        }
        return result
    }




    static movesThrough = (position: Position, from_symbol: Symbol, sq_from: Square, sq_through: Square) => {
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
                result = Attacks.pieceRayHit(sq_from, position.occupied().without(sq_through), from_symbol.name)
                break
            }
        }
        return result
    }



    static double_pushes = (position: Position, from_symbol: Symbol, sq_from: Square) => {
        var result = Bitboard.Zero
        switch (from_symbol.name) {
            case 'pawn': {
                result = Attacks.pawnMoves(sq_from, position.getColor(sq_from), 'forward2')
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
                break
            }
        }

        return result
    }




    static pushes = (position: Position, from_symbol: Symbol, sq_from: Square) => {
        var result = Bitboard.Zero
        switch (from_symbol.name) {
            case 'pawn': {
                result = Attacks.pawnMoves(sq_from, position.getColor(sq_from), 'forward')
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
                break
            }
        }

        return result
    }



    static captures = (position: Position, from_symbol: Symbol, sq_from: Square): Bitboard => {
        var result = Bitboard.Zero
        switch (from_symbol.name) {
            case 'turn': {
                switch (position.roleOn(sq_from)) {
                    case 'pawn': {
                        result = Attacks.pawnCapturesColor(sq_from, position.getColor(sq_from))
                    }
                }
            }
            case 'pawn': {
                result = Attacks.pawnCapturesColor(sq_from, position.getColor(sq_from))
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
            case 'turn': {
                result = position.bb_turn()
            } break
            case 'opponent': {
                result = position.bb_opponent()
            } break
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

        if (symbol.props.includes('p')) {
            result = result.bitand(Pawns.passed_pawns(position))
        }
        if (symbol.props.includes('x')) {
            result = Bitboard.Full
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
        case 'Approaches': {
            if (ins.becomes) {
                MatchActions.approaches(ins, history, slice)
            }
        }
        case 'CastlesLongTo': {
            if (ins.becomes) {
                MatchActions.castles_long_to(ins, history, slice)
            }
        } break
        case 'CapturePromotes': {
            if (ins.becomes) {
                MatchActions.capture_promotes(ins, history, slice)
            }
        } break
        case 'PushPromotes': {
            if (ins.becomes) {
                MatchActions.push_promotes(ins, history, slice)
            }
        } break
        case 'Pushes': {
            if (ins.becomes) {
                MatchActions.pushes(ins, history, slice)
            }
        } break
        case 'DoublePushes': {
            if (ins.becomes) {
                MatchActions.double_pushes(ins, history, slice)
            }
        } break
        case 'PushBlocks': {
            if (ins.becomes) {
                MatchActions.push_blocks(ins, history, slice)
            }
        } break
        case 'MovesTo': {
            if (ins.becomes) {
                MatchActions.movesTo(ins, history, slice)
            }
        } break
        case 'SingleSafeEvadeTo': {
            if (ins.becomes) {
                MatchActions.singleSafeEvadeTo(ins, history, slice)
            }
        } break
        case 'EvadesTo': {
            if (ins.becomes) {
                MatchActions.evadesTo(ins, history, slice)
            }
        } break
        case 'Forks': {
            if (ins.becomes) {
                MatchActions.forks(ins, history, slice)
            } else {
                MatchFilters.forks(ins, history, slice)
            }
        } break
        case 'Defends': {
            if (ins.becomes) {
                MatchActions.defends(ins, history, slice)
            } else {
                MatchFilters.defends(ins, history, slice)
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
        } break
        case 'isUnevadableFor': {
            if (ins.becomes) {
            } else {
                MatchFilters.isUnevadeableFor(ins, history, slice)
            }
        } break
        case 'noSafeEvadableFor': {
            if (ins.becomes) {
            } else {
                MatchFilters.noSafeEvadeableFor(ins, history, slice)
            }
        } break
        case 'noSafeCapturable': {
            if (ins.becomes) {
            } else {
                MatchFilters.noSafeCapturable(ins, history, slice)
            }
        } break
        case 'onSupportedKingZone': {
            if (ins.becomes) {
            } else {
                MatchFilters.onSupportedKingZone(ins, history, slice)
            }
        } break
        case 'isUnblockableFor': {
            if (ins.becomes) {
            } else {
                MatchFilters.isUnblockableFor(ins, history, slice)
            }
        } break
        case 'onlyDefendedBy': {
            if (ins.becomes) {
            } else {
                MatchFilters.onlyDefendedBy(ins, history, slice)
            }
        } break
        case 'notAttacked': {
            if (ins.becomes) {
            } else {
                MatchFilters.notAttacked(ins, history, slice)
            }
        } break
        case 'hanging': {
            if (ins.becomes) {
            } else {
                MatchFilters.hanging(ins, history, slice)
            }
        } break
        case 'eyesThrough': {
            if (ins.becomes) {
                //MatchActions.evadesTo(ins, history, slice)
            } else {
                MatchFilters.eyesThrough(ins, history, slice)
            }
        } break
        case 'skewers': {
            if (ins.becomes) {
                MatchActions.eyesThrough(ins, history, slice)
            } else {
                MatchFilters.eyesThrough(ins, history, slice)
            }
        } break
        case 'Pins': {
            if (ins.becomes) {
                MatchActions.pins(ins, history, slice)
            } else {
                //MatchFilters.eyesThrough(ins, history, slice)
            }
        } break
        case 'Unpins': {
            if (ins.becomes) {
                MatchActions.unpins(ins, history, slice)
            } else {
                //MatchFilters.eyesThrough(ins, history, slice)
            }
        } break
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
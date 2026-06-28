import { Bitboard, opposite, Position, strip_color_except_pawns } from "./types.js"
import * as Attacks from './attacks.js'

export class CheckFinder {
    static isCheck = (position: Position) => {
        let finder = new CheckFinder(position)

        return finder.isCheck
    }

    checkers: Bitboard

    constructor(private position: Position, private color = position.turn) {
        this.checkers = Bitboard.Zero

        const sq_color_king = position.bb_king.bitand(position.bb_color(color)).single()!

        const occupied = position.occupied()
        for (let sq_checker of position.bb_color(opposite(color))) {
            const direction = position.pieceOn(sq_checker)!
            const aa = Attacks.pieceCheck(sq_checker, occupied, strip_color_except_pawns(direction))
            if (aa.has(sq_color_king))
                this.checkers.set(sq_checker)
        }
    }

    get isCheck() {
        return this.checkers.isNotEmpty()
    }
}
import { Bitboard, opposite, Position, strip_color_except_pawns } from "./types.js"
import * as Attacks from './attacks.js'
import * as log from './logs.js'

export class CheckFinder {

    static isCheckmate = (position: Position) => {
        let finder = new CheckFinder(position)

        return finder.isCheckmate
    }



    static isCheck = (position: Position) => {
        let finder = new CheckFinder(position)

        return finder.isCheck
    }

    checkers: Bitboard
    safe_evades: Bitboard
    check_rays: Bitboard[]
    blocks_check: Bitboard

    constructor(private position: Position, private color = position.turn) {
        this.checkers = Bitboard.Zero
        this.safe_evades = Bitboard.Zero

        const sq_color_king = position.bb_king.bitand(position.bb_color(color)).single()!

        const occupied = position.occupied()

        const friends = position.bb_color(color).without(sq_color_king)
        const checkers = position.bb_color(opposite(color))

        for (let sq_checker of checkers) {
            const direction = position.pieceOn(sq_checker)!
            const aa = Attacks.pieceCheck(sq_checker, occupied, strip_color_except_pawns(direction))
            if (aa.has(sq_color_king))
                this.checkers.set(sq_checker)
        }

        let evades = Attacks.kingMovesAll(sq_color_king)
        evades = evades.bitdiff(friends)

        let checked = Bitboard.Zero

        for (let sq_checker of checkers) {
            const direction = position.pieceOn(sq_checker)!
            const aa = Attacks.pieceCheck(sq_checker, occupied.without(sq_color_king), strip_color_except_pawns(direction))
            checked = checked.bitor(aa)
        }

        evades = evades.bitdiff(checked)

        this.safe_evades = evades


        const check_rays: Bitboard[] = []

        for (let sq_checker of this.checkers) {
            check_rays.push(Attacks.rayBetweenFromTo(sq_checker, sq_color_king))
        }

        this.check_rays = check_rays

        const blocks_check = Bitboard.Zero

        for (let ray of check_rays) {
            for (let sq_blocker of friends) {
                const direction = position.pieceOn(sq_blocker)!
                const aa = Attacks.pieceCheck(sq_blocker, occupied, strip_color_except_pawns(direction))
                const block = aa.bitand(ray).single()
                if (block !== undefined) {
                    blocks_check.set(block)
                }
            }
        }


        this.blocks_check = blocks_check

    }

    get isCheck() {
        return this.checkers.isNotEmpty()
    }


    get isCheckmate() {
        return this.checkers.isNotEmpty() && this.safe_evades.isEmpty() && this.blocks_check.isEmpty()
    }
}
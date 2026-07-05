import { Bitboard, Move, Position, Rank } from "../types.js";
import * as log from '../logs.js'
import * as P from './p.js'
import * as A from './a.js'
import * as B from './b.js'

export function checkRank(p: Position) {
    let result = []

    const bb_rank = B.bb_rank(P.sq_opponentKing(p)[1])

    let occupied = p.occupied()
    for (let sq_from of P.bb_turnMajors(p)) {
        let aa_to = A.slides(sq_from, occupied, 'vertical')

        for (let sq_to of aa_to.bitand(bb_rank)) {
            result.push(Move.normal(sq_from, sq_to))
        }
    }
    return result
}

export function kingEvadeSafe(pos: Position) {
    let result = []

    let sq_from = P.sq_turnKing(pos)

    let aa_to = A.kingMoves(sq_from)

    let aa_unsafe = A.turnUnsafe(pos)
    for (let sq_to of aa_to.bitdiff(aa_unsafe)) {
        result.push(Move.normal(sq_from, sq_to))
    }

    return result
}

export function isCheck(pos: Position) {
    return A.turnUnsafe(pos).has(P.sq_turnKing(pos))
}
import { Bitboard, Position } from "./types.js";
import * as Attacks from './attacks.js'

export function passed_pawns(position: Position): Bitboard {

    let result = Bitboard.Zero

    const occupied = position.occupied()
    for (let w_pawn of position.bb_pawn.bitand(position.bb_white)) {

        if (!Attacks.ray(w_pawn, 'up').intersects(occupied)) {
            result = result.set(w_pawn)
        }
    }

    for (let b_pawn of position.bb_pawn.bitdiff(position.bb_white)) {

        if (!Attacks.ray(b_pawn, 'up').intersects(occupied)) {
            result = result.set(b_pawn)
        }
    }



    return result
}
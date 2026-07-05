import { Position } from "../types.js";

export function sq_turnKing(p: Position) {
    return p.bb_turn().bitand(p.bb_king).single()!
}



export function sq_opponentKing(p: Position) {
    return p.bb_opponent().bitand(p.bb_king).single()!
}

export function bb_turnMajors(p: Position) {
    return p.bb_turn().bitand(p.bb_rook.bitor(p.bb_queen))
}
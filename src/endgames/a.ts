import { Bitboard, Piece, Position, Square } from "../types.js";
import * as Attacks from '../attacks.js'

export const SlidingDirections = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right', 'horizontal', 'vertical', 'straight', 'diagonal']
export type SlidingDirections = typeof SlidingDirections[number]

export function slides(from: Square, occupied: Bitboard, direction: SlidingDirections) {
    switch (direction) {
        case 'horizontal': {
            return Attacks.rayHit(from, occupied, 'left').bitor(Attacks.rayHit(from, occupied, 'right'))
        } break
        case 'vertical': {
            return Attacks.rayHit(from, occupied, 'up').bitor(Attacks.rayHit(from, occupied, 'down'))
        } break
    }
    throw `bad sliding directions ${direction}`
}

export function kingMoves(from: Square) {
    return Attacks.kingMovesAll(from)
}

export function covers(from: Square, occupied: Bitboard, piece: Piece) {
    switch (piece) {
        case 'white-pawn': {
            return Attacks.kingMoves(from, 'up-left')
                .bitor(Attacks.kingMoves(from, 'up-right'))
        }
        case 'black-pawn': {
            return Attacks.kingMoves(from, 'down-left')
                .bitor(Attacks.kingMoves(from, 'down-right'))
        }
        case 'black-queen':
        case 'black-rook':
        case 'black-bishop':
        case 'white-queen':
        case 'white-rook':
        case 'white-bishop': {
            return Attacks.pieceRayHit(from, occupied, piece.split('-')[1])
        }
    }
    throw `bad piece for covers ${piece}`
}

export function turnUnsafe(pos: Position) {
    let occupied = pos.occupied()
    let aa_unsafe = Bitboard.Zero
    for (let sq_opponent of pos.bb_opponent()) {
        let opponent = pos.pieceOn(sq_opponent)!
        let aa_opponent = covers(sq_opponent, occupied, opponent)
        aa_unsafe = aa_unsafe.bitor(aa_opponent)
    }

    return aa_unsafe
}
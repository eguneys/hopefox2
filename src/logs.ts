import { Bitboard, Debug, Position } from "./types.js";

export function bb(bb: Bitboard, title?: string) {
    if (title) {
        console.log(title)
    }
    console.log(Debug.Bitboard(bb))
}
export function bb2(bb: Bitboard, bb2: Bitboard, title?: string) {
    if (title) {
        console.log(title)
    }
    console.log(Debug.Bitboard(bb))
    console.log(Debug.Bitboard(bb2))
}

export function position(pos: Position, title?: string) {
    if (title) {
        console.log(title)
    }
    console.log(Debug.Position(pos))
}
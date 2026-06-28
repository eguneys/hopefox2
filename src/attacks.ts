import { Bitboard, Directions, Files, KnightDirections, PieceDirections, Ranks, Square, Squares } from "./types.js"

const ray_masks = generate_ray_masks()

function generate_ray_masks() {
    let res: Bitboard[][] = [...new Array(8).keys()].map(_ => [])

    const df = [0, 0, -1, 1, -1, 1, -1, 1]
    const dr = [1, -1, 0, 0, 1, 1, -1, -1]

    for (let square of Squares) {
        const start_file = Files.indexOf(square[0])
        const start_rank = Ranks.indexOf(square[1])

        for (let dir = 0; dir < 8; dir++) {
            let mask = Bitboard.Zero
            let f = start_file + df[dir]
            let r = start_rank + dr[dir]

            while (f >= 0 && f < 8 && r >= 0 && r < 8) {
                const target_square = `${Files[f]}${Ranks[r]}`
                mask = mask.bitor(Bitboard.fromSquare(target_square))

                f += df[dir]
                r += dr[dir]
            }

            res[dir][Squares.indexOf(square)] = mask
        }
    }
    return res
}


const king_masks = generate_king_masks()

function generate_king_masks() {
    let res: Bitboard[][] = [...new Array(8).keys()].map(_ => [])

    const df = [0, 0, -1, 1, -1, 1, -1, 1]
    const dr = [1, -1, 0, 0, 1, 1, -1, -1]

    for (let square of Squares) {
        const start_file = Files.indexOf(square[0])
        const start_rank = Ranks.indexOf(square[1])

        for (let dir = 0; dir < 8; dir++) {
            let mask = Bitboard.Zero
            let f = start_file + df[dir]
            let r = start_rank + dr[dir]

            if (f >= 0 && f < 8 && r >= 0 && r < 8) {
                const target_square = `${Files[f]}${Ranks[r]}`
                mask = mask.bitor(Bitboard.fromSquare(target_square))
            }

            res[dir][Squares.indexOf(square)] = mask
        }
    }
    return res
}

export function kingMoves(square: Square, direction: Directions) {
    return king_masks[Directions.indexOf(direction)][Squares.indexOf(square)]
}




const knight_masks = generate_knight_masks()

function generate_knight_masks() {
    let res: Bitboard[][] = [...new Array(8).keys()].map(_ => [])

    const df = [-1, 1, -1, 1, -2, 2, -2, 2]
    const dr = [2, 2, -2, -2, 1, 1, -1, -1]

    for (let square of Squares) {
        const start_file = Files.indexOf(square[0])
        const start_rank = Ranks.indexOf(square[1])

        for (let dir = 0; dir < 8; dir++) {
            let mask = Bitboard.Zero
            let f = start_file + df[dir]
            let r = start_rank + dr[dir]

            if (f >= 0 && f < 8 && r >= 0 && r < 8) {
                const target_square = `${Files[f]}${Ranks[r]}`
                mask = mask.bitor(Bitboard.fromSquare(target_square))
            }

            res[dir][Squares.indexOf(square)] = mask
        }
    }
    return res
}

export const KnightDirectionsPlus = ['up2', 'down2', 'left2', 'right2', 'up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right']
export type KnightDirectionsPlus = typeof KnightDirectionsPlus[number]

export function knightMoves(square: Square, direction: KnightDirections) {
    return knight_masks[KnightDirections.indexOf(direction)][Squares.indexOf(square)]
}

export function disectKnightDirectionPlus(direction: KnightDirectionsPlus): KnightDirections[] {
    switch (direction) {
        case 'up2': return ['up2-left', 'up2-right']
        case 'down2': return ['down2-left', 'down2-right']
        case 'left2': return ['up-left2', 'down-left2']
        case 'right2': return ['up-right2', 'down-right2']
        case 'up': return ['up-left2', 'up2-left', 'up-right2', 'up2-right']
        case 'down': return ['down-left2', 'down2-left', 'down-right2', 'down2-right']
        case 'left': return ['up-left', 'up-left2', 'down-left', 'down-left2']
        case 'right': return ['up-right', 'up-right2', 'down-right', 'down-right2']
        case 'up-left': return ['up2-left', 'up-left2']
        case 'up-right': return ['up2-right', 'up-right2']
        case 'down-left': return ['down2-left', 'down-left2']
        case 'down-right': return ['down2-right', 'down-right2']
    }
    throw 'bad knight direction'
}

export function knightMovesPlus(square: Square, direction: KnightDirectionsPlus) {
    return disectKnightDirectionPlus(direction)
        .reduce((acc, _) => acc.bitor(knightMoves(square, _)), Bitboard.Zero)
}


export const DirectionPlus = ['horizontal', 'vertical', 'straight', 'diagonal']
export type DirectionPlus = typeof DirectionPlus[number]



export function ray(square: Square, direction: Directions) {
    return ray_masks[Directions.indexOf(direction)][Squares.indexOf(square)]
}


function positiveRayHit(occ: Bitboard, rayMask: Bitboard, sliderBit: Bitboard) {

    // o = occ & ray_mask
    const oLo = (occ.lo & rayMask.lo) >>> 0;
    const oHi = (occ.hi & rayMask.hi) >>> 0;

    // 2 * slider_bit  (left shift by 1, with carry from lo into hi)
    const carry = (sliderBit.lo >>> 31) & 1;
    const dLo = (sliderBit.lo << 1) >>> 0;
    const dHi = ((sliderBit.hi << 1) | carry) >>> 0;

    // o - d  (64-bit subtraction with borrow, wrapping like -% in Zig)
    let subLo = (oLo - dLo) >>> 0;
    const borrow = oLo < dLo ? 1 : 0;
    let subHi = (oHi - dHi - borrow) >>> 0;

    // (sub) ^ occ
    const xorLo = (subLo ^ occ.lo) >>> 0;
    const xorHi = (subHi ^ occ.hi) >>> 0;

    // & ray_mask
    const lo = (xorLo & rayMask.lo) >>> 0
    const hi = (xorHi & rayMask.hi) >>> 0

    return new Bitboard(lo, hi)
}

// Reverses all 32 bits within a single word
function bitReverse32(x: number): number {
    x = ((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1);
    x = ((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2);
    x = ((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4);
    x = ((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8);
    x = (x >>> 16) | (x << 16);
    return x >>> 0;
}

// Reverses a full 64-bit value represented as {hi, lo}
function bitReverse64(v: Bitboard): Bitboard {
    // Reversing 64 bits swaps which word ends up on top,
    // and each word's bits are individually reversed.
    const hi = bitReverse32(v.lo)
    const lo = bitReverse32(v.hi)

    return new Bitboard(lo, hi)
}

function negativeRayHit(occ: Bitboard, rayMask: Bitboard, sliderBit: Bitboard): Bitboard {
    // o = bitReverse(occ & ray_mask)
    const masked: Bitboard = new Bitboard(
        (occ.lo & rayMask.lo) >>> 0,
        (occ.hi & rayMask.hi) >>> 0,
    );
    const o = bitReverse64(masked);

    // r = bitReverse(slider_bit)
    const r = bitReverse64(sliderBit);

    // 2 * r  (left shift by 1, with carry from lo into hi)
    const carry = (r.lo >>> 31) & 1;
    const dLo = (r.lo << 1) >>> 0;
    const dHi = ((r.hi << 1) | carry) >>> 0;

    // o - d  (wrapping 64-bit subtraction, same as -% in Zig)
    const subLo = (o.lo - dLo) >>> 0;
    const borrow = o.lo < dLo ? 1 : 0;
    const subHi = (o.hi - dHi - borrow) >>> 0;

    // (sub) ^ o
    const xored = new Bitboard(
        (subLo ^ o.lo) >>> 0,
        (subHi ^ o.hi) >>> 0,
    );

    // bitReverse(...) & ray_mask
    const reversedBack = bitReverse64(xored);
    return new Bitboard(
        (reversedBack.lo & rayMask.lo) >>> 0,
        (reversedBack.hi & rayMask.hi) >>> 0,
    );
}

export function rayHit(square: Square, occupied: Bitboard, direction: Directions) {
    const ray_mask = ray(square, direction)
    const slider_bit = Bitboard.fromSquare(square)

    switch (direction) {
        case 'right':
        case 'up':
        case 'up-left':
        case 'up-right': {
            return positiveRayHit(occupied, ray_mask, slider_bit)
        }
        default: {
            return negativeRayHit(occupied, ray_mask, slider_bit)
        }
    }
}

export const RayPieceDirections = ['queen', 'bishop', 'rook']
export type RayPieceDirections = typeof RayPieceDirections[number]

export function disectRayPieceDirections(direction: RayPieceDirections): Directions[] {
    switch (direction) {
        case 'queen': return ['up', 'left', 'right', 'down', 'up-left', 'up-right', 'down-left', 'down-right']
        case 'bishop': return ['up-left', 'up-right', 'down-left', 'down-right']
        case 'rook': return ['up', 'left', 'right', 'down']
    }
    throw 'bad ray piece direction'
}

export function pieceRayHit(square: Square, occupied: Bitboard, direction: RayPieceDirections) {
    return disectRayPieceDirections(direction)
        .reduce((acc, _) => acc.bitor(rayHit(square, occupied, _)), Bitboard.Zero)
}

export function pieceCheck(square: Square, occupied: Bitboard, direction: PieceDirections): Bitboard {
    switch (direction) {
        case 'queen':
        case 'bishop':
        case 'rook': return pieceRayHit(square, occupied, direction)
        case 'knight': return KnightDirections
            .reduce((acc, _) => acc.bitor(knightMoves(square, _)), Bitboard.Zero)
        case 'king': return Directions
            .reduce((acc, _) => acc.bitor(kingMoves(square, _)), Bitboard.Zero)
        case 'white-pawn': return kingMoves(square, 'up-left')
            .bitor(kingMoves(square, 'up-right'))
        case 'black-pawn': return kingMoves(square, 'down-left')
            .bitor(kingMoves(square, 'down-right'))
    }
    throw `bad piece direction ${direction}`
}

export function directionFromTo(from: Square, to: Square) {
    if (from[0] === to[0]) {
        return Ranks.indexOf(from[1]) < Ranks.indexOf(to[1]) ? 'up' : 'down'
    } else if (from[1] === to[1]) {
        return Files.indexOf(from[0]) < Files.indexOf(to[0]) ? 'right' : 'left'
    } else if (Files.indexOf(from[0]) < Files.indexOf(to[0])) {
        return Ranks.indexOf(from[1]) < Ranks.indexOf(to[1]) ? 'up-right' : 'down-right'
    } else {
        return Ranks.indexOf(from[1]) < Ranks.indexOf(to[1]) ? 'up-left' : 'down-left'
    }
}

export function rayBetweenFromTo(from: Square, to: Square) {
    return rayHit(from, Bitboard.fromSquare(to), directionFromTo(from, to)).unset(to)
}
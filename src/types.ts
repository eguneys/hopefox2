export type Color = 'white' | 'black'

export const Files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export type File = typeof Files[number]

export const Ranks = ['1', '2', '3', '4', '5', '6', '7', '8']

export const RanksReversed = Ranks.slice(0).reverse()

export type Rank = typeof Ranks[number]

export type Square = `${File}${Rank}`

const Squares: Square[] = Files.flatMap(file => Ranks.map(rank => `${file}${rank}`))

export const Directions = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right']
export const KnightDirections = ['up2-left', 'up2-right', 'down2-left', 'down2-right', 'up-left2', 'up-right2', 'down-left2', 'down-right2']
export const PawnDirections = ['forward', 'backward', 'forward2', 'backward2', 'side-left', 'side-right']
export const DirectionPlus = ['horizontal', 'vertical', 'straight', 'diagonal']
export const DirectionPiece = ['queen', 'king', 'black-pawn', 'white-pawn', 'knight', 'bishop', 'rook']


export const KingZones = ['white-king-home', 'black-king-home', 'white-queen-home', 'black-queen-home']

export type Directions = typeof Directions[number]
export type KnightDirections = typeof KnightDirections[number]
export type PawnDirections = typeof PawnDirections[number]
export type DirectionPlus = typeof DirectionPlus[number]
export type DirectionPieces = typeof DirectionPiece[number]

export const Roles = ['queen', 'bishop', 'king', 'rook', 'knight', 'pawn']
export const PromotionRoles = ['queen', 'bishop', 'rook', 'knight']

export type Role = typeof Roles[number]
export type PromotionRole = typeof PromotionRoles[number]


export type Piece = `${Color}-${Role}`

export function squareToIndex(square: Square) {
    const file = Files.indexOf(square[0]!)
    const rank = Ranks.indexOf(square[1]!)
    return rank * 8 + file
}

export function king_distance(from: Square, to: Square) {
    const from_file = Files.indexOf(from[0]!)
    const to_file = Files.indexOf(to[0]!)

    const from_rank = Ranks.indexOf(from[0]!)
    const to_rank = Ranks.indexOf(to[0]!)

    return Math.max(Math.abs(from_file - to_file), Math.abs(from_rank - to_rank))
}

export class Bitboard {
    static fromSquare = (square: Square): Bitboard => {
        const index = squareToIndex(square)
        return index >= 32 ?
            new Bitboard(0, 1 << (index - 32)) :
            new Bitboard(1 << index, 0)
    }


    static get Zero(): Bitboard { return new Bitboard(0, 0) }
    static get A1(): Bitboard { return Bitboard.fromSquare('a1') }
    static get B1(): Bitboard { return Bitboard.fromSquare('b1') }
    static get C1(): Bitboard { return Bitboard.fromSquare('c1') }
    static get D1(): Bitboard { return Bitboard.fromSquare('d1') }
    static get E1(): Bitboard { return Bitboard.fromSquare('e1') }
    static get F1(): Bitboard { return Bitboard.fromSquare('f1') }
    static get G1(): Bitboard { return Bitboard.fromSquare('g1') }
    static get H1(): Bitboard { return Bitboard.fromSquare('h1') }

    static get A2(): Bitboard { return Bitboard.fromSquare('a2') }
    static get B2(): Bitboard { return Bitboard.fromSquare('b2') }
    static get C2(): Bitboard { return Bitboard.fromSquare('c2') }
    static get D2(): Bitboard { return Bitboard.fromSquare('d2') }
    static get E2(): Bitboard { return Bitboard.fromSquare('e2') }
    static get F2(): Bitboard { return Bitboard.fromSquare('f2') }
    static get G2(): Bitboard { return Bitboard.fromSquare('g2') }
    static get H2(): Bitboard { return Bitboard.fromSquare('h2') }

    static get A3(): Bitboard { return Bitboard.fromSquare('a3') }
    static get B3(): Bitboard { return Bitboard.fromSquare('b3') }
    static get C3(): Bitboard { return Bitboard.fromSquare('c3') }
    static get D3(): Bitboard { return Bitboard.fromSquare('d3') }
    static get E3(): Bitboard { return Bitboard.fromSquare('e3') }
    static get F3(): Bitboard { return Bitboard.fromSquare('f3') }
    static get G3(): Bitboard { return Bitboard.fromSquare('g3') }
    static get H3(): Bitboard { return Bitboard.fromSquare('h3') }

    static get A4(): Bitboard { return Bitboard.fromSquare('a4') }
    static get B4(): Bitboard { return Bitboard.fromSquare('b4') }
    static get C4(): Bitboard { return Bitboard.fromSquare('c4') }
    static get D4(): Bitboard { return Bitboard.fromSquare('d4') }
    static get E4(): Bitboard { return Bitboard.fromSquare('e4') }
    static get F4(): Bitboard { return Bitboard.fromSquare('f4') }
    static get G4(): Bitboard { return Bitboard.fromSquare('g4') }
    static get H4(): Bitboard { return Bitboard.fromSquare('h4') }

    static get A5(): Bitboard { return Bitboard.fromSquare('a5') }
    static get B5(): Bitboard { return Bitboard.fromSquare('b5') }
    static get C5(): Bitboard { return Bitboard.fromSquare('c5') }
    static get D5(): Bitboard { return Bitboard.fromSquare('d5') }
    static get E5(): Bitboard { return Bitboard.fromSquare('e5') }
    static get F5(): Bitboard { return Bitboard.fromSquare('f5') }
    static get G5(): Bitboard { return Bitboard.fromSquare('g5') }
    static get H5(): Bitboard { return Bitboard.fromSquare('h5') }

    static get A6(): Bitboard { return Bitboard.fromSquare('a6') }
    static get B6(): Bitboard { return Bitboard.fromSquare('b6') }
    static get C6(): Bitboard { return Bitboard.fromSquare('c6') }
    static get D6(): Bitboard { return Bitboard.fromSquare('d6') }
    static get E6(): Bitboard { return Bitboard.fromSquare('e6') }
    static get F6(): Bitboard { return Bitboard.fromSquare('f6') }
    static get G6(): Bitboard { return Bitboard.fromSquare('g6') }
    static get H6(): Bitboard { return Bitboard.fromSquare('h6') }

    static get A7(): Bitboard { return Bitboard.fromSquare('a7') }
    static get B7(): Bitboard { return Bitboard.fromSquare('b7') }
    static get C7(): Bitboard { return Bitboard.fromSquare('c7') }
    static get D7(): Bitboard { return Bitboard.fromSquare('d7') }
    static get E7(): Bitboard { return Bitboard.fromSquare('e7') }
    static get F7(): Bitboard { return Bitboard.fromSquare('f7') }
    static get G7(): Bitboard { return Bitboard.fromSquare('g7') }
    static get H7(): Bitboard { return Bitboard.fromSquare('h7') }

    static get A8(): Bitboard { return Bitboard.fromSquare('a8') }
    static get B8(): Bitboard { return Bitboard.fromSquare('b8') }
    static get C8(): Bitboard { return Bitboard.fromSquare('c8') }
    static get D8(): Bitboard { return Bitboard.fromSquare('d8') }
    static get E8(): Bitboard { return Bitboard.fromSquare('e8') }
    static get F8(): Bitboard { return Bitboard.fromSquare('f8') }
    static get G8(): Bitboard { return Bitboard.fromSquare('g8') }
    static get H8(): Bitboard { return Bitboard.fromSquare('h8') }

    static clone = (other: Bitboard) => new Bitboard(other.lo, other.hi)

    constructor(public lo: number, public hi: number) { }

    has(sq: Square) {
        return this.bitand(Bitboard.fromSquare(sq)).isNotEmpty()
    }

    bitand(other: Bitboard) {
        return new Bitboard(this.lo & other.lo, this.hi & other.hi)
    }

    bitor(other: Bitboard) {
        return new Bitboard(this.lo | other.lo, this.hi | other.hi)
    }

    bitdiff(other: Bitboard) {
        return new Bitboard(this.lo & ~other.lo, this.hi & ~other.hi)
    }

    set(sq: Square) {
        const result = this.bitor(Bitboard.fromSquare(sq))
        this.lo = result.lo
        this.hi = result.hi
        return result
    }
    unset(sq: Square) {
        const result = this.bitdiff(Bitboard.fromSquare(sq))
        this.lo = result.lo
        this.hi = result.hi
        return result
    }




    isNotEmpty() {
        return this.lo !== 0 || this.hi !== 0
    }

    isEmpty() {
        return this.lo === 0 && this.hi === 0
    }
}



export class Position {
    bb_white: Bitboard
    bb_pawn: Bitboard
    bb_bishop: Bitboard
    bb_rook: Bitboard
    bb_queen: Bitboard
    bb_knight: Bitboard
    bb_king: Bitboard
    turn: Color

    static get Zero() { return new Position() }

    static clone = (other: Position) => {
        let res = new Position()
        res.bb_white = Bitboard.clone(other.bb_white)
        res.bb_pawn = Bitboard.clone(other.bb_pawn)
        res.bb_bishop = Bitboard.clone(other.bb_bishop)
        res.bb_rook = Bitboard.clone(other.bb_rook)
        res.bb_queen = Bitboard.clone(other.bb_queen)
        res.bb_knight = Bitboard.clone(other.bb_knight)
        res.bb_king = Bitboard.clone(other.bb_king)
        res.turn = other.turn
        return res
    }

    private constructor() {
        this.bb_white = Bitboard.Zero
        this.bb_pawn = Bitboard.Zero
        this.bb_bishop = Bitboard.Zero
        this.bb_rook = Bitboard.Zero
        this.bb_queen = Bitboard.Zero
        this.bb_knight = Bitboard.Zero
        this.bb_king = Bitboard.Zero
        this.turn = 'white'
    }

    getColor(sq: Square): Color {
        return this.bb_white.has(sq) ? 'white' : 'black'
    }

    roleOn(sq: Square): Role | undefined {
        if (this.bb_pawn.has(sq)) {
            return 'pawn'
        }
        if (this.bb_bishop.has(sq)) {
            return 'bishop'
        }
        if (this.bb_rook.has(sq)) {
            return 'rook'
        }
        if (this.bb_knight.has(sq)) {
            return 'knight'
        }
        if (this.bb_king.has(sq)) {
            return 'king'
        }
        if (this.bb_queen.has(sq)) {
            return 'queen'
        }
    }

    pieceOn(sq: Square): Piece | undefined {
        if (this.bb_pawn.has(sq)) {
            return this.bb_white.has(sq) ? 'white-pawn' : 'black-pawn'
        }
        if (this.bb_bishop.has(sq)) {
            return this.bb_white.has(sq) ? 'white-bishop' : 'black-bishop'
        }
        if (this.bb_rook.has(sq)) {
            return this.bb_white.has(sq) ? 'white-rook' : 'black-rook'
        }
        if (this.bb_knight.has(sq)) {
            return this.bb_white.has(sq) ? 'white-knight' : 'black-knight'
        }
        if (this.bb_king.has(sq)) {
            return this.bb_white.has(sq) ? 'white-king' : 'black-king'
        }
        if (this.bb_queen.has(sq)) {
            return this.bb_white.has(sq) ? 'white-queen' : 'black-queen'
        }
    }

    removePiece(sq: Square) {
        this.bb_pawn.unset(sq)
        this.bb_knight.unset(sq)
        this.bb_bishop.unset(sq)
        this.bb_rook.unset(sq)
        this.bb_king.unset(sq)
        this.bb_queen.unset(sq)
        this.bb_white.unset(sq)
    }

    addPiece(sq: Square, piece: Piece) {
        switch (piece) {
            case 'white-pawn': {
                this.bb_pawn.set(sq)
                this.bb_white.set(sq)
                break
            }
            case 'white-king': {
                this.bb_king.set(sq)
                this.bb_white.set(sq)
                break
            }
            case 'white-knight': {
                this.bb_knight.set(sq)
                this.bb_white.set(sq)
                break
            }
            case 'white-bishop': {
                this.bb_bishop.set(sq)
                this.bb_white.set(sq)
                break
            }
            case 'white-rook': {
                this.bb_rook.set(sq)
                this.bb_white.set(sq)
                break
            }
            case 'white-queen': {
                this.bb_queen.set(sq)
                this.bb_white.set(sq)
                break
            }
            case 'black-pawn': {
                this.bb_pawn.set(sq)
                break
            }
            case 'black-king': {
                this.bb_king.set(sq)
                break
            }
            case 'black-knight': {
                this.bb_knight.set(sq)
                break
            }
            case 'black-bishop': {
                this.bb_bishop.set(sq)
                break
            }
            case 'black-rook': {
                this.bb_rook.set(sq)
                break
            }
            case 'black-queen': {
                this.bb_queen.set(sq)
                break
            }
        }
    }

    makeNormalMove(move: Move): Piece | undefined {
        let from_piece = this.pieceOn(move.from)!
        let to_piece = this.pieceOn(move.to)

        this.removePiece(move.to)
        this.removePiece(move.from)
        this.addPiece(move.to, from_piece)

        return to_piece
    }

    makePromotionMove(move: Move): Piece | undefined {
        let from_color = this.getColor(move.from)!
        let to_piece = this.pieceOn(move.to)

        this.removePiece(move.to)
        this.removePiece(move.from)
        this.addPiece(move.to, `${from_color}-${move.promotion}`)

        return to_piece
    }

    makeCastlingMove(move: Move) {
    }

    makeMove(move: Move): Piece | undefined {
        switch (move.kind) {
            case 'normal': {
                return this.makeNormalMove(move)
            }
            case 'castling': {
                this.makeCastlingMove(move)
                return undefined
            }
            case 'promotion': {
                return this.makePromotionMove(move)
            }
        }
    }
}

export class Debug {

    static Bitboard = (a: Bitboard) => {
        let res = ''
        for (let rank of RanksReversed) {
            for (let file of Files) {
                const sq = `${file}${rank}`
                res += a.has(sq) ? 'o' : '.'
            }
            if (rank !== '1') res += '\n'
        }
        return res
    }

    static Position = (a: Position) => {
        let res = ''
        for (let rank of RanksReversed) {
            for (let file of Files) {
                const sq = `${file}${rank}`
                const piece = a.pieceOn(sq)
                res += piece === undefined ? '.' : Debug.Piece(piece)
            }
            if (rank !== '1') res += '\n'
        }
        return res
    }

    static Piece = (a: Piece) => {
        switch (a) {
            case 'white-pawn': return 'P'
            case 'white-bishop': return 'B'
            case 'white-rook': return 'R'
            case 'white-knight': return 'N'
            case 'white-king': return 'K'
            case 'white-queen': return 'Q'
            case 'black-pawn': return 'p'
            case 'black-bishop': return 'b'
            case 'black-rook': return 'r'
            case 'black-knight': return 'n'
            case 'black-king': return 'k'
            case 'black-queen': return 'q'
        }
    }

    static movesAsSans = (pos: Position, moves: Move[]) => {
        return 'Nf3'
    }
}

export class DebugParser {
    static Position = (str: string, turn: Color = 'white'): Position => {
        str = str.trim()
        let result = Position.Zero

        result.turn = turn

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let char = str[i * 8 + j]!

                let piece = DebugParser.Piece(char)

                if (piece) {
                    const file = Files[j]
                    const rank = Ranks[i]
                    const square = `${file}${rank}`
                    result.addPiece(square, piece)
                }
            }
        }


        return result
    }

    static Piece = (char: string): Piece | undefined => {
        switch (char) {
            case 'P': return 'white-pawn'
            case 'B': return 'white-bishop'
            case 'N': return 'white-knight'
            case 'R': return 'white-rook'
            case 'Q': return 'white-queen'
            case 'K': return 'white-king'
            case 'p': return 'black-pawn'
            case 'b': return 'black-bishop'
            case 'n': return 'black-knight'
            case 'r': return 'black-rook'
            case 'q': return 'black-queen'
            case 'k': return 'black-king'
        }
    }
}

export type FenString = string

export class Fen {

    static Initial: FenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    static get InitialPosition() { return Fen.parse(Fen.Initial) }

    static parse(fen: FenString): Position {
        const position = Position.Zero

        let [board, color, castling] = fen.split(' ')

        let irank = 0
        for (let files of board!.split('/')) {
            let ifile = 0
            for (let char of files) {
                const piece = Fen.parsePiece(char)

                if (piece === undefined) {
                    const skip = char.charCodeAt(0) - '0'.charCodeAt(0)
                    ifile += skip
                    continue;
                }

                const file = Files[ifile]
                const rank = RanksReversed[irank]
                position.addPiece(`${file}${rank}`, piece)
                ifile += 1
            }
            irank += 1
        }

        return position
    }

    static parsePiece(char: string) {
        switch (char) {
            case 'b': return 'black-bishop'
            case 'p': return 'black-pawn'
            case 'n': return 'black-knight'
            case 'k': return 'black-king'
            case 'r': return 'black-rook'
            case 'q': return 'black-queen'
            case 'B': return 'white-bishop'
            case 'P': return 'white-pawn'
            case 'N': return 'white-knight'
            case 'K': return 'white-king'
            case 'R': return 'white-rook'
            case 'Q': return 'white-queen'
        }
    }
}

export type MoveKind = 'normal' | 'promotion' | 'castling' | 'enpassant'

export class Move {

    static get None() { return new Move('a1', 'a1', 'normal', undefined) }

    constructor(public from: Square, public to: Square, public kind: MoveKind, public promotion?: PromotionRole) { }

    isNone() {
        return this.from === this.to
    }
}


export class Uci {
    static parse(uci: string, position: Position): Move {
        const from = uci.slice(0, 2)
        const to = uci.slice(2, 4)
        const promotion = uci[4] ? Uci.parseRole(uci[4]) : undefined


        if (promotion) {
            return new Move(from, to, 'promotion', promotion)
        }

        if (position.roleOn(from) === 'king') {
            if (king_distance(from, to) === 2) {
                return new Move(from, to, 'castling')
            }
        }
        return new Move(from, to, 'normal')
    }

    static parseRole(char: string): PromotionRole {
        switch (char) {
            case 'b': return 'bishop'
            case 'n': return 'knight'
            case 'r': return 'rook'
            case 'q': return 'queen'
        }
        throw 'bad promotion role'
    }
}
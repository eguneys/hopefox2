import { CheckFinder } from "./check.js"
import { Debug, Move, Position, Uci } from "./types.js"

export class DebugMove {

    static Uci = (pos: Position, move: Move) => {
        return `${move.from}${move.to}`
    }

    static San = (pos: Position, move: Move) => {
        const from_role = pos.roleOn(move.from)!
        const to = pos.pieceOn(move.to)

        const pos_after = Position.clone(pos)
        pos_after.makeMove(move)

        const isCapture = to !== undefined

        const isCheck = CheckFinder.isCheck(pos_after)
        const isCheckmate = CheckFinder.isCheckmate(pos_after)

        return `${Debug.SanRole(from_role)}${isCapture ? 'x' : ''}${move.to}${isCheckmate ? '#' : isCheck ? '+' : ''}`
    }


    static movesAsSans = (pos: Position, moves: Move[]) => {
        let result = []
        let ipos = Position.clone(pos)
        for (let move of moves) {
            if (move.isNone()) continue
            result.push(DebugMove.San(ipos, move))
            ipos.makeMove(move)
        }
        return result
    }

    static ucisAsSans = (pos: Position, ucis: string[]) => {
        let result = []
        let ipos = Position.clone(pos)
        for (let uci of ucis) {
            let move = Uci.parse(uci, ipos)
            result.push(DebugMove.San(ipos, move))
            ipos.makeMove(move)
        }
        return result
    }


    static movesAsUcis = (pos: Position, moves: Move[]) => {
        let result = []
        let ipos = Position.clone(pos)
        for (let move of moves) {
            if (move.isNone()) continue
            result.push(DebugMove.Uci(ipos, move))
            ipos.makeMove(move)
        }
        return result
    }


    static ucisAsMoves = (pos: Position, ucis: string[]) => {
        let result = []
        let ipos = Position.clone(pos)
        for (let uci of ucis) {
            let move = Uci.parse(uci, ipos)
            result.push(move)
            ipos.makeMove(move)
        }
        return result
    }

    static positionAsUcis = (pos: Position, ucis: string[]) => {
        let result = []
        let ipos = Position.clone(pos)
        for (let uci of ucis) {
            let move = Uci.parse(uci, ipos)
            result.push(move)
            ipos.makeMove(move)
        }
        return ipos
    }





}
import { CheckFinder } from "./check.js"
import { Debug, Move, Position, Uci } from "./types.js"

export class DebugMove {
    static San = (pos: Position, move: Move) => {
        const from_role = pos.roleOn(move.from)!
        const to = pos.pieceOn(move.to)

        const pos_after = Position.clone(pos)
        pos_after.makeMove(move)

        const isCapture = to !== undefined

        const isCheck = CheckFinder.isCheck(pos_after)

        return `${Debug.SanRole(from_role)}${isCapture ? 'x' : ''}${move.to}${isCheck ? '+' : ''}`
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
}
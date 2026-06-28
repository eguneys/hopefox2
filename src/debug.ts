import { CheckFinder } from "./check.js"
import { Debug, Move, Position } from "./types.js"

export class DebugMove {
    static San = (pos: Position, move: Move) => {
        const from_role = pos.roleOn(move.from)!

        const pos_after = Position.clone(pos)
        pos_after.makeMove(move)

        const isCheck = CheckFinder.isCheck(pos_after)

        return `${Debug.SanRole(from_role)}${move.to}${isCheck ? '+' : ''}`
    }


    static movesAsSans = (pos: Position, moves: Move[]) => {
        let result = []
        let ipos = Position.clone(pos)
        for (let move of moves) {
            result.push(DebugMove.San(ipos, move))
            ipos.makeMove(move)
        }
        return result
    }
}
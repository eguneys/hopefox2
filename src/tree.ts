import { Move } from "./types.js";

export type MoveNode = {
    move: Move,
    parent: number
}

export class MoveTree {

    items: MoveNode[]

    constructor() {
        this.items = [{ move: Move.None, parent: -1 }]
    }

    get size() {
        return this.items.filter(_ => !_.move.isNone()).length
    }

    appendSlice(moves: Move[]) {

        let parent = 0
        for (let move of moves) {
            let new_parent = this.items.findIndex(_ => _.parent === parent && _.move.equals(move))

            if (new_parent === -1) {
                this.items.push({ move, parent })
                parent = this.items.length - 1
            } else {
                parent = new_parent
            }
        }
    }


    getChildrenAfter(moves: Move[]) {
        let parent = 0
        for (let move of moves) {
            parent = this.items.findIndex(_ => _.parent === parent && _.move.equals(move))

            if (parent === -1) {
                return undefined
            }
        }

        return this.items.filter(_ => _.parent === parent).map(_ => _.move)
    }


    getLinesWith(moves: Move[]): Move[][] {
        let children = this.getChildrenAfter(moves)!

        if (!children || children.length === 0) {
            return [moves]
        }

        return children.flatMap(child => this.getLinesWith([...moves, child]))
    }




    getLinesWithOpponentMoves(moves: Move[]) {

        let result = []
        let parent = 0

        let i = 0
        outer: for (let move of moves) {
            if (i++ % 2 === 0) continue
            let candidates = this.items.filter(_ => _.parent === parent)

            for (let ocandidate of candidates) {
                let candidate = this.items.indexOf(ocandidate)

                let op = this.items.findIndex(_ => _.parent === candidate && _.move.equals(move))

                parent = op

                if (op === -1) {
                    continue
                }

                result.push(candidate)
                result.push(op)
                continue outer
            }
            break
        }

        return this.getLinesWith(result.map(_ => this.items[_].move))
    }
}
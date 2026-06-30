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
}
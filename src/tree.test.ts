import { expect, it } from 'vitest'
import { MoveTree } from './tree.js'
import { DebugMove } from './debug.js'
import { Fen, Uci } from './types.js'


it('basic usage', () => {

    let tree = new MoveTree()

    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 g1f3'.split(' ')))


    let childrenNf3 = tree.getChildrenAfter(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5'.split(' ')))

    const e4e5Position = DebugMove.positionAsUcis(Fen.InitialPosition, 'e2e4 e7e5'.split(' '))

    expect(childrenNf3).toBeDefined()
    expect(childrenNf3!.length).toEqual(1)
    expect(DebugMove.Uci(e4e5Position, childrenNf3![0])).toEqual('g1f3')
})



it('variations', () => {

    let tree = new MoveTree()

    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 g1f3'.split(' ')))
    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 b1c3'.split(' ')))


    let childrenNf3 = tree.getChildrenAfter(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5'.split(' ')))

    const e4e5Position = DebugMove.positionAsUcis(Fen.InitialPosition, 'e2e4 e7e5'.split(' '))

    expect(childrenNf3).toBeDefined()
    expect(childrenNf3!.length).toEqual(2)
    expect(DebugMove.Uci(e4e5Position, childrenNf3![0])).toEqual('g1f3')
    expect(DebugMove.Uci(e4e5Position, childrenNf3![1])).toEqual('b1c3')
})



it('get lines with', () => {

    let tree = new MoveTree()

    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 g1f3'.split(' ')))
    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 b1c3'.split(' ')))
    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 h7h5'.split(' ')))


    let e4Lines = tree.getLinesWith(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4'.split(' ')))

    expect(e4Lines!.length).toEqual(3)
    expect(DebugMove.movesAsUcis(Fen.InitialPosition, e4Lines[0]).join(' ')).toEqual('e2e4 e7e5 g1f3')
    expect(DebugMove.movesAsUcis(Fen.InitialPosition, e4Lines[1]).join(' ')).toEqual('e2e4 e7e5 b1c3')
    expect(DebugMove.movesAsUcis(Fen.InitialPosition, e4Lines[2]).join(' ')).toEqual('e2e4 h7h5')
})



it('get lines with opponent moves', () => {

    let tree = new MoveTree()

    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 g1f3 a7a5 a2a4'.split(' ')))
    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 b1c3 h7h5 h2h4'.split(' ')))
    tree.appendSlice(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 h7h5'.split(' ')))


    let e4Lines = tree.getLinesWithOpponentMoves(DebugMove.ucisAsMoves(Fen.InitialPosition, 'e2e4 e7e5 b1c3 h7h5'.split(' ')))

    expect(e4Lines).toBeDefined()
    expect(e4Lines!.length).toEqual(1)
    expect(DebugMove.movesAsUcis(Fen.InitialPosition, e4Lines[0]).join(' ')).toEqual('e2e4 e7e5 b1c3 h7h5 h2h4')
})
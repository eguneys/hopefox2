import * as V from './vocabulary.js'
import { Position } from '../types.js'
import { MoveTree } from '../tree.js'
import { History, Slice } from '../history.js'

/*
* king_t queen_t rook_t king2_o
* rook   .cutRank
* queen  *checkRank     *becomes queen2
* king2  *kingEvadeSafe *becomes king3
* rook   *checkRank     *becomes rook2
* king3  *kingEvadeSafe *becomes king4
* queen2 *checkRank     *becomes queen3
*/
export function search(h: History, slice: Slice) {
}
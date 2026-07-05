import { Bitboard, Rank, Ranks } from "../types.js";

export const BB_Ranks = [Bitboard.Rank1, Bitboard.Rank2, Bitboard.Rank3, Bitboard.Rank4, Bitboard.Rank5, Bitboard.Rank6, Bitboard.Rank7, Bitboard.Rank8]

export function bb_rank(rank: Rank) {
    return BB_Ranks[Ranks.indexOf(rank)]
}
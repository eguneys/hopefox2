import { Fen, Position, Uci } from './types.js'

export type CsvPuzzle = {
    id: string,
    position: Position
    solution: string[]
}

export function read_csv(csv: string): CsvPuzzle[] {
    return csv.split('\n')!.map(line => {
        let [id, fen, moves] = line.split(',')

        let [move, ...rest] = moves!.split(' ')

        const position = Fen.parse(fen!)

        position.makeMove(Uci.parse(move!, position))

        return { id: id!, position, solution: rest }
    })
}
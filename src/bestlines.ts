import { CsvPuzzle } from "./db.js"
import { DebugMove } from "./debug.js"
import { ScriptRunner } from "./runner.js"
import { MoveTree } from "./tree.js"
import { Move, Position } from "./types.js"

export class BestLine {

    runner: Map<string, ScriptRunner>

    constructor(scripts: [string, string][], private posets: string[][]) {
        this.runner = new Map()

        for (let [name, script] of scripts)
            this.runner.set(name, ScriptRunner.parse(script))
    }

    findBestLine(position: Position): BestLineResult {

        let result: BestLineResult = {
            bestTreeScripts: [],
        }

        for (let [name, script] of this.runner) {
            let { moves, preview } = script.runOnPosition(position)
            if (moves.size > 0)
                result.bestTreeScripts.push([name, moves])
        }

        let poset = this.posets.find(_ => _.length === result.bestTreeScripts.length && result.bestTreeScripts.every(s => _.includes(s[0])))

        if (poset) {
            result.bestTreeScripts.sort((a, b) => {
                return poset.indexOf(a[0]) - poset.indexOf(b[0])
            })
        }


        return result
    }
}


export type BestLineResult = {
    bestTreeScripts: [string, MoveTree][]
}


/*

function topologicalSort<T>(items: T[], posets: T[][]) {
    // Build a directed graph of all constraints
    const graph = new Map<T, T[]>();
    const inDegree = new Map();

    // Initialize
    items.forEach(item => {
        graph.set(item, []);
        inDegree.set(item, 0);
    });

    // Add edges from all posets
    posets.forEach(poset => {
        for (let i = 0; i < poset.length - 1; i++) {
            const from = poset[i];
            const to = poset[i + 1];
            if (items.includes(from) && items.includes(to)) {
                graph.get(from)!.push(to);
                inDegree.set(to, inDegree.get(to) + 1);
            }
        }
    });

    // Kahn's algorithm
    const queue: T[] = [];
    const result: T[] = [];

    items.forEach(item => {
        if (inDegree.get(item) === 0) queue.push(item);
    });

    while (queue.length > 0) {
        const current = queue.shift()!;
        result.push(current);

        graph.get(current)!.forEach(neighbor => {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        });
    }

    // Check for cycles
    if (result.length !== items.length) {
        throw new Error('Cycle detected in partial order');
    }

    return result;
}

*/
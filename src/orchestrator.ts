import { CsvPuzzle } from "./db.js";
import { Bucket, ScriptFilter } from "./runner.js";

export class Orchestrator {

    scripts: Map<string, ScriptFilter>

    constructor(scripts: Map<string, string>) {
        this.scripts = new Map()

        for (let [name, script] of scripts) {
            this.scripts.set(name, new ScriptFilter(script))
        }
    }

    filterPuzzles(puzzles: CsvPuzzle[]) {
        const filters = new Map([
            ['exact', exact_filter],
            ['negative', negative_filter],
            ['false', false_filter]
        ])

        let negatives = []
        let exacts = []
        let falses = []

        let nb_exact = 0

        for (let [name, script] of this.scripts) {
            let result = script.filterPuzzles(puzzles, filters)

            exacts.push(...result.get('exact')!)
            negatives.unshift(...result.get('negative')!)
            falses.unshift(...result.get('false')!)
        }

        let negative_preview = 'All done!'
        for (let negative of negatives) {
            if (!exacts.find(_ => _.csv_puzzle.id === negative.csv_puzzle.id)) {
                negative_preview = negative.preview
                break
            }
        }

        let false_preview = 'All done!'
        if (negative_preview = 'All done!') {
            for (let negative of falses) {
                if (!exacts.find(_ => _.csv_puzzle.id === negative.csv_puzzle.id)) {
                    false_preview = negative.preview
                    break
                }
            }
        }


        let exacts_unique = new Set()

        for (let exact of exacts) {
            exacts_unique.add(exact.csv_puzzle.id)
        }

        nb_exact = exacts_unique.size

        return `
Exact: ${nb_exact}
Negative:
${negative_preview}
False:
${false_preview}
`.trim()
    }
}


function negative_filter(bucket: Bucket) {
    return bucket.negative
}

function exact_filter(bucket: Bucket) {
    return bucket.exact
}

function false_filter(bucket: Bucket) {
    return bucket.moves_diverge_at !== undefined
}
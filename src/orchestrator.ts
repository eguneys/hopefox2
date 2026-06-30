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
            ['negative', negative_filter]
        ])

        let negatives = []
        let exacts = []

        let nb_exact = 0

        for (let [name, script] of this.scripts) {
            let result = script.filterPuzzles(puzzles, filters)

            nb_exact += result.get('exact')!.length

            exacts.push(...result.get('exact')!)
            negatives.push(...result.get('negative')!)
        }

        let negative_preview = 'All done!'
        for (let negative of negatives) {
            if (!exacts.find(_ => _.csv_puzzle.id === negative.csv_puzzle.id)) {
                negative_preview = negative.preview
                break
            }
        }


        return `
Exact: ${nb_exact}
Negative:
${negative_preview}
`.trim()
    }
}


function negative_filter(bucket: Bucket) {
    return bucket.negative
}

function exact_filter(bucket: Bucket) {
    return bucket.exact
}
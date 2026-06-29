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
        let negative_preview = ''

        const filters = new Map([
            ['exact', exact_filter],
            ['negative', negative_filter]
        ])

        for (let [name, script] of this.scripts) {


            let result = script.filterPuzzles(puzzles, filters)

            negative_preview += result.get('negative')!.slice(0, 3).map(_ => _.preview).join('\n')
        }

        return `
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
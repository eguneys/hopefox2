import { Symbol, Instruction } from "./parser.js";

export class ScriptBinder {

    static bindInstructions = (a: Instruction[], b: Instruction[]) => {
        let all_symbols: Symbol[] = []
        function all_symbols_push(symbol: Symbol) {
            if (all_symbols.find(_ => SymbolEqualsId(_, symbol))) {
                return
            }
            all_symbols.push(symbol)
        }
        let living_symbols: Symbol[] = []
        for (let ai of a) {
            all_symbols_push(ai.action.symbol!)
            all_symbols_push(ai.from.symbol!)
            if (ai.to) all_symbols_push(ai.to.symbol!)
            if (ai.and) all_symbols_push(ai.and.symbol!)
            if (ai.becomes) all_symbols_push(ai.becomes.symbol!)
            if (ai.action.symbol!.name === 'Captures') {
                living_symbols = living_symbols.filter(_ => !SymbolEqualsId(_, ai.to!.symbol!))
            }
            if (ai.becomes) {
                living_symbols = living_symbols.filter(_ => !SymbolEqualsId(_, ai.from!.symbol!))
                living_symbols.push(ai.becomes.symbol!)
            } else {
                if (!living_symbols.find(_ => SymbolEqualsId(_, ai.from.symbol!))) {
                    living_symbols.push(ai.from.symbol!)
                }
            }
        }

        function find_unused_symbol_with_name(symbol: Symbol) {
            let existing = all_symbols.filter(l => SymbolEqualsName(l, symbol))
            let new_id = Math.max(...existing.map(_ => _.id === '' ? 1 : parseInt(_.id))) + 1

            return {
                name: symbol.name,
                id: `${new_id}`,
                props: symbol.props
            }
        }

        function replaces_push(symbol: Symbol) {
            if (replaces.find(r => SymbolEqualsId(r[0], symbol))) {
                return
            }
            if (rebumps.find(l => SymbolEqualsId(l, symbol))) {
                return
            }
            if (all_symbols.find(l => SymbolEqualsId(l, symbol))) {
                let replace_with = living_symbols.filter(l => SymbolEqualsName(l, symbol))
                let replace_with2 = find_unused_symbol_with_name(symbol)

                for (let replace of [...replace_with, replace_with2]) {
                    replaces.push([symbol, replace])
                }
            } else {
                uniques.push(symbol)
            }
        }

        let uniques: Symbol[] = []
        let rebumps: Symbol[] = []
        let replaces: [Symbol, Symbol][] = []
        for (let bb of b) {
            replaces_push(bb.from.symbol!)
            if (bb.becomes) {
                if (replaces.find(_ => SymbolEqualsId(_[0], bb.from.symbol!))) {
                    rebumps.push(bb.becomes.symbol!)
                }
            }
            if (bb.action.symbol!.name === 'Check') {
                replaces_push(bb.action.symbol!)
            }
            if (bb.to) replaces_push(bb.to.symbol!)
            if (bb.and) replaces_push(bb.and.symbol!)
        }


        let replace_groups: number[][] = []
        for (let replace of replaces) {
            let same_replaces = replaces.filter(_ => SymbolEqualsId(_[0], replace[0]))
            let indexes = same_replaces.map(_ => replaces.indexOf(_))
            if (!replace_groups.find(_ => _.length === indexes.length && indexes.every(i => _.indexOf(i) !== -1)))
                replace_groups.push(indexes)
        }

        let replace_combinations = pickCombinations(replace_groups)


        let result_sets: Instruction[][] = []
        for (let combination of replace_combinations) {
            result_sets_push_combination(combination.map(_ => replaces[_]))
        }

        function result_sets_push_combination(replace_combination: [Symbol, Symbol][]) {

            let rebump_replaces: [Symbol, Symbol][] = []
            for (let rebump of rebumps) {
                rebump_replaces.push([rebump, find_unused_symbol_with_name_for_b(replace_combination.map(_ => _[1]), rebump)])
            }

            let all_replaces = [...rebump_replaces, ...replace_combination]

            let b_result = [...structuredClone(b)]
            for (let replace of all_replaces) {
                b_result_do_replace(replace)
            }

            let merge_point_dots = []
            for (let i = a.length - 1; i >= 0; i--) {
                if (a[i].becomes) {
                    break
                }
                merge_point_dots.push(a[i])
            }

            let b_result2: Instruction[] = []

            for (let i = 0; i < b_result.length; i++) {
                if (b_result[i].becomes) {
                    b_result2.push(...b_result.slice(i))
                    break
                }
                if (find_same_dot_in_merger(b_result[i], merge_point_dots)) {
                    continue
                }
                b_result2.push(b_result[i])
            }

            function find_same_dot_in_merger(a: Instruction, b: Instruction[]) {

                for (let bb of b) {
                    if (SymbolEqualsId(bb.from.symbol!, a.from.symbol!)) {
                        if (SymbolEqualsId(bb.action.symbol!, a.action.symbol!)) {
                            return true
                        }
                    }
                }

                return false
            }

            result_sets.push([...a, ...b_result2])


            function b_result_do_replace(replace: [Symbol, Symbol]) {

                let first_replace = true
                for (let i = 0; i < b.length; i++) {
                    let new_from = new_replaced_symbol(b[i].from.symbol!)
                    if (new_from) {
                        b_result[i].from.symbol = new_from
                        first_replace = false
                    }
                    let new_action = new_replaced_symbol(b[i].action.symbol!)
                    if (new_action) {
                        b_result[i].action.symbol = new_action
                        first_replace = false
                    }
                    if (b[i].to) {
                        let new_to = new_replaced_symbol(b[i].to!.symbol!)
                        if (new_to) {
                            b_result[i].to!.symbol = new_to
                            first_replace = false
                        }
                    }
                    if (b[i].and) {
                        let new_and = new_replaced_symbol(b[i].and!.symbol!)
                        if (new_and) {
                            b_result[i].and!.symbol = new_and
                            first_replace = false
                        }
                    }
                    if (b[i].becomes) {
                        let new_becomes = new_replaced_symbol(b[i].becomes!.symbol!)
                        if (new_becomes) {
                            b_result[i].becomes!.symbol = new_becomes
                            first_replace = false
                        }
                    }
                }

                function new_replaced_symbol(symbol: Symbol) {
                    if (SymbolEqualsId(symbol, replace[0])) {
                        return first_replace ? replace[1] : strip_props(replace[1])
                    }
                }
            }


            function find_unused_symbol_with_name_for_b(replace_combination: Symbol[], symbol: Symbol) {
                let existing1 = all_symbols.filter(l => SymbolEqualsName(l, symbol))
                let existing2 = replace_combination.filter(l => SymbolEqualsName(l, symbol))
                let existing3 = rebump_replaces.map(_ => _[1]).filter(l => SymbolEqualsName(l, symbol))
                let existing = [...existing1, ...existing2, ...existing3]

                let new_id = Math.max(...existing.map(_ => _.id === '' ? 1 : parseInt(_.id))) + 1

                return {
                    name: symbol.name,
                    id: `${new_id}`,
                    props: symbol.props
                }
            }
        }

        return result_sets
    }

}

// pick all combinations of picking each item from a list of number lists.
function pickCombinations(a: number[][]): number[][] {
    if (a.length === 0) return [];
    if (a.length === 1) return a[0].map(item => [item]);

    const result: number[][] = [];

    function backtrack(index: number, current: number[]) {
        if (index === a.length) {
            result.push([...current]);
            return;
        }

        for (const item of a[index]) {
            current.push(item);
            backtrack(index + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return result;
}


export class ScriptWriter {

    static write = (a: Instruction[]) => {
        return new ScriptWriter(a).write()
    }

    private constructor(private list: Instruction[]) { }

    write() {
        let result = ``
        let last_becomes
        for (let i = 0; i < this.list.length; i++) {
            if (i > 0) result += '\n'
            let item = this.list[i]
            if (item.becomes === undefined) {
                if (last_becomes) {
                    if (SymbolEqualsId(this.list[last_becomes].becomes!.symbol!, item.from.symbol!)) {
                        result += this.writeBeginDot(i, last_becomes)
                        continue
                    }
                }
                result += this.writeBeginSymbolDot(i)
            } else {
                result += this.writeStar(i)
                last_becomes = i
            }
        }
        return result
    }

    writeBeginDot(i: number, last_becomes: number) {
        let item = this.list[i]
        let action = `.${ScriptWriter.writeAction(item.action.symbol!)}`
        let to = item.to ? ` ${ScriptWriter.writeSymbol(item.to.symbol!)}` : ''
        let and = item.and ? ` .and ${ScriptWriter.writeSymbol(item.and.symbol!)}` : ''
        let nb_indent = this.list[last_becomes].action.begin_column
        let indent = ' '.repeat(nb_indent - 2)
        return `${indent}${action}${to}${and}`
    }
    writeBeginSymbolDot(i: number) {
        let item = this.list[i]
        let from = `${ScriptWriter.writeSymbol(item.from.symbol!)}`
        let action = ` .${ScriptWriter.writeAction(item.action.symbol!)}`
        let to = item.to ? ` ${ScriptWriter.writeSymbol(item.to.symbol!)}` : ''
        let and = item.and ? ` .and ${ScriptWriter.writeSymbol(item.and.symbol!)}` : ''

        return `${from}${action}${to}${and}`
    }
    writeStar(i: number) {
        let item = this.list[i]
        let from = `${ScriptWriter.writeSymbol(item.from.symbol!)}`
        let action = ` *${ScriptWriter.writeAction(item.action.symbol!)}`
        let to = item.to ? ` ${ScriptWriter.writeSymbol(item.to.symbol!)}` : ''
        let and = item.and ? ` *and ${ScriptWriter.writeSymbol(item.and.symbol!)}` : ''
        let becomes = ` *becomes ${ScriptWriter.writeSymbol(item.becomes!.symbol!)}`

        return `${from}${action}${to}${and}${becomes}`
    }

    static writeAction(a: Symbol) {
        return `${a.name}${a.id}`
    }
    static writeSymbol(a: Symbol) {
        let props = a.props === '' ? '' : `_${a.props}`
        return `${a.name}${a.id}${props}`
    }

}

function SymbolEqualsId(a: Symbol, b: Symbol) {
    return a.name === b.name && a.id === b.id
}
function SymbolEqualsName(a: Symbol, b: Symbol) {
    return a.name === b.name
}

function strip_props(a: Symbol) {

    return {
        name: a.name,
        id: a.id,
        props: ''
    }
}
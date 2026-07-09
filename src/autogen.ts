import { Instruction, Symbol } from "./parser.js";
import { ScriptRunner } from "./runner.js";
import { Position } from "./types.js";

export class ScriptBinder {
    static bind = (a: Instruction[], b: Instruction[]) => {

        function follow_binding(orig: Symbol, i: Instruction) {
            if (ScriptBinder.SymbolOrigEquals(orig, i)) {
                if (i.becomes !== undefined) {
                    return i.becomes!.symbol!
                } else {
                    return i.from.symbol!
                }
            }
            if (i.action.symbol!.name === 'Captures') {
                if (ScriptBinder.SymbolEquals(orig, i.to!.symbol!)) {
                    return undefined
                }
            }
            return orig
        }

        let res = []
        for (let aa of a) {
            res.push(aa)
        }


        let replaces: [Symbol, Symbol][] = []

        for (let bb of b) {
            let orig = bb.from.symbol
            for (let rr of res) {
                let dest = follow_binding(orig!, rr)
                if (dest) {
                    orig = dest
                } else {
                    break
                }
            }

            if (orig && !ScriptBinder.SymbolEquals(orig, bb.from.symbol!)) {
                replaces.push([bb.from.symbol!, ScriptBinder.orig_symbol(orig)])
                if (bb.becomes) {
                    let bump = bb.becomes.symbol!
                    outer: while (true) {
                        replaces.push([bump, ScriptBinder.bump_symbol(bump)])
                        for (let bb2 of b) {
                            if (ScriptBinder.SymbolEquals(bb2.from.symbol!, bump)) {
                                if (bb2.becomes) {
                                    bump = bb2.becomes.symbol!
                                    continue outer
                                }
                            }
                        }
                        break
                    }
                }
            } else {
            }
        }

        function replace_instruction(oi: Instruction, replaces: [Symbol, Symbol][]) {
            let i = structuredClone(oi)
            let from_symbol = i.from.symbol!
            let becomes_symbol = i.becomes?.symbol
            for (let r of replaces) {
                let off = ScriptBinder.symbol(i.from.symbol!).length - ScriptBinder.symbol(r[1]).length
                if (ScriptBinder.SymbolEquals(from_symbol, r[0])) {
                    i.from.symbol = r[1]
                    i.action.begin_column -= off
                }
                if (becomes_symbol) {
                    if (ScriptBinder.SymbolEquals(becomes_symbol!, r[0])) {
                        i.becomes!.symbol = r[1]
                    }
                }
            }

            return i
        }

        for (let bb of b) {
            let i = replace_instruction(bb, replaces)
            let last_becomes = res.length - res.slice(0).reverse().findIndex(_ => _.becomes)

            if (res.slice(last_becomes).find(ei => ScriptBinder.InstructionEquals(ei, i))) {
                continue
            }

            res.push(i)
        }


        return new ScriptBinder(res)
    }

    static orig_symbol(symbol: Symbol) {
        return {
            name: symbol.name,
            id: symbol.id,
            props: ''
        }
    }



    static bump_symbol(symbol: Symbol) {
        return {
            name: symbol.name,
            id: `${parseInt(symbol.id) + 1}`,
            props: ''
        }
    }

    constructor(public list: Instruction[]) { }

    writeList() {
        let res = ''
        for (let i = 0; i < this.list.length; i++) {
            if (i > 0) res += '\n'
            res += this.instruction(i)
        }
        return res
    }

    instruction(i: number) {
        if (this.list[i].becomes) {
            return this.becomes(i)
        } else {
            let last_becomes = this.list[i - 1]
            for (let j = i - 1; j >= 0; j--) {
                if (this.list[j].becomes !== undefined) {
                    last_becomes = this.list[j]
                    break
                }
            }
            return this.filter(i, last_becomes)
        }
    }

    becomes(iref: number) {
        let i = this.list[iref]
        let from = ScriptBinder.symbol(i.from.symbol!)
        let action = ScriptBinder.action(i.action.symbol!)
        let to = i.to ? ` ${ScriptBinder.symbol(i.to.symbol!)}` : ''
        let and = i.and ? ` *and ${ScriptBinder.symbol(i.and.symbol!)}` : ''
        let becomes = ScriptBinder.symbol(i.becomes!.symbol!)
        return `${from} *${action}${to}${and} *becomes ${becomes}`
    }

    filter(iref: number, previous?: Instruction) {
        let i = this.list[iref]

        let indent = 0
        if (previous !== undefined) {
            if (previous.becomes !== undefined) {
                if (ScriptBinder.SymbolEquals(previous.becomes.symbol!, i.from.symbol!)) {
                    indent = previous.action.begin_column - 2
                }
            } else {
                if (ScriptBinder.SymbolEquals(previous.from.symbol!, i.from.symbol!)) {
                    indent = previous.action.begin_column - 2
                }
            }
        }

        let from = ScriptBinder.symbol(i.from.symbol!)
        let action = ScriptBinder.action(i.action.symbol!)
        let to = i.to ? ` ${ScriptBinder.symbol(i.to.symbol!)}` : ''

        return indent > 0 ? `${' '.repeat(indent)}.${action}${to}` : `${from} .${action}${to}`
    }

    static action(symbol: Symbol) {
        let props = symbol.props.length > 0 ? `_${symbol.props}` : ''
        return `${symbol.name}${symbol.id}${props}`
    }

    static symbol(symbol: Symbol) {
        let props = symbol.props.length > 0 ? `_${symbol.props}` : ''
        return `${symbol.name}${symbol.id}${props}`
    }

    static SymbolEquals = (a: Symbol, b: Symbol) => {
        return (a.name === b.name && a.id === b.id && a.props === b.props)
    }

    static SymbolOrigEquals = (a: Symbol, i: Instruction) => {
        if (a.name === i.from.symbol!.name) {
            return true
        }
        return false
    }

    static InstructionEquals = (a: Instruction, b: Instruction) => {
        if (a.becomes === undefined && b.becomes === undefined) {
            if (ScriptBinder.SymbolEquals(a.action.symbol!, b.action.symbol!)) {

                if (ScriptBinder.SymbolEquals(a.from.symbol!, b.from.symbol!)) {
                    return true
                }
            }
        }

        return false
    }
}

export class AutoGen {

    static fromScripts = (scripts: string[]) => {
        return new AutoGen(scripts)
    }

    runners: ScriptRunner[]
    private constructor(private scripts: string[]) {
        this.runners = scripts.map(_ => ScriptRunner.parse(_))
    }

    genScriptsOnPosition(position: Position) {

        const step = (depth: number, pos: Position, instructions: Instruction[], script_list: number[]): number[][] => {
            if (depth === 0) {
                return []
            }
            let result = []
            for (let i = 0; i < this.runners.length; i++) {
                let runner = ScriptRunner.fromList(
                    ScriptBinder.bind(instructions, this.runners[i].instructions).list)
                console.log(ScriptBinder.bind(instructions, this.runners[i].instructions).writeList())
                console.log()
                console.log()
                console.log()
                let { moves } = runner.runOnPosition(pos)
                let matched_lines = moves.getLinesWith([]).filter(_ => _.length > 0)

                for (let line of matched_lines) {
                    let p2 = Position.clone(pos)

                    for (let move of line) {
                        p2.makeMove(move)
                    }
                    result.push(...step(depth - 1, p2, runner.instructions, [...script_list, i]))
                }
            }
            if (result.length === 0) {
                return [script_list]
            }
            return result
        }

        let result = []
        let lists = step(3, position, [], [])

        for (let list of lists) {
            let m = list.reduce((a, b) => ScriptBinder.bind(a.list, this.runners[b].instructions), ScriptBinder.bind([], []))
            result.push(m.writeList())
        }
        return { lists: result, indexes: lists }
    }


}
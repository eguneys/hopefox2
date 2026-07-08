import { Instruction, Symbol } from "./parser.js";
import { ScriptRunner } from "./runner.js";
import { Position } from "./types.js";

export class ScriptBinder {
    static bind = (a: Instruction[], b: Instruction[]) => {

        function follow_binding(orig: Symbol, i: Instruction) {
            if (ScriptBinder.SymbolEquals(orig, i.from.symbol!)) {
                if (i.becomes !== undefined) {
                    return i.becomes!.symbol!
                } else {
                    return i.from.symbol!
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

            let orig = bb.from.symbol!
            for (let rr of res) {
                orig = follow_binding(orig, rr)
            }

            if (orig !== bb.from.symbol) {
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
            }
        }

        function replace_instruction(i: Instruction, replaces: [Symbol, Symbol][]) {
            let from_symbol = i.from.symbol!
            let becomes_symbol = i.becomes?.symbol
            for (let r of replaces) {
                if (ScriptBinder.SymbolEquals(from_symbol, r[0])) {
                    i.from.symbol = r[1]
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
            res.push(replace_instruction(bb, replaces))
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
            return this.filter(i, this.list[i - 1])
        }
    }

    becomes(iref: number) {
        let i = this.list[iref]
        let from = this.symbol(i.from.symbol!)
        let action = this.action(i.action.symbol!)
        let to = i.to ? ` ${this.symbol(i.to.symbol!)}` : ''
        let and = i.and ? ` *and ${this.symbol(i.and.symbol!)}` : ''
        let becomes = this.symbol(i.becomes!.symbol!)
        return `${from} *${action}${to}${and} *becomes ${becomes}`
    }

    filter(iref: number, previous?: Instruction) {
        let i = this.list[iref]

        let indent = 0
        if (previous !== undefined) {
            if (previous.becomes !== undefined) {
                if (ScriptBinder.SymbolEquals(previous.becomes.symbol!, i.from.symbol!)) {
                    indent = previous.action.begin_column - 1
                }
            } else {
                if (ScriptBinder.SymbolEquals(previous.from.symbol!, i.from.symbol!)) {
                    indent = previous.action.begin_column - 1
                }
            }
        }

        let from = this.symbol(i.from.symbol!)
        let action = this.action(i.action.symbol!)
        let to = i.to ? ` ${this.symbol(i.to.symbol!)}` : ''

        return indent > 0 ? `${' '.repeat(indent - 2)}.${action}${to}` : `${from} .${action}${to}`
    }

    action(symbol: Symbol) {
        let props = symbol.props.length > 0 ? `_${symbol.props}` : ''
        return `${symbol.name}${symbol.id}${props}`
    }

    symbol(symbol: Symbol) {
        let props = symbol.props.length > 0 ? `_${symbol.props}` : ''
        return `${symbol.name}${symbol.id}${props}`
    }

    static SymbolEquals = (a: Symbol, b: Symbol) => {
        return (a.name === b.name && a.id === b.id && a.props === b.props)
    }
}

export class AutoGen {

    static run = (position: Position) => {
        let res = new AutoGen(position)
        return res.getScripts()
    }

    constructor(private position: Position) {

    }

    getScripts() {


        let use3 = `
rook_o .hanging
bishop_t *Captures knight_o *becomes bishop2
bishop3_t *Captures bishop2 *becomes bishop4
          .hanging
`.trim()

        let use2 = `
rook_o .hanging
bishop_o .hanging
knight_t *Forks queen_o *and bishop *becomes knight2
queen *SingleSafeDefendFor bishop *becomes queen2
`.trim()


        let use1 = `
rook_o .hanging
knight_t *Checks rook *becomes knight2
         .notAttacked
         .noSafeEvadableFor rook
`.trim()

        let p1 = ScriptRunner.parse(use1)
        let p2 = ScriptRunner.parse(use2)
        let p3 = ScriptRunner.parse(use3)

        //let { moves, preview } = p2.runOnPosition(this.position)
        //console.log(preview)

        let p12 = ScriptBinder.bind(p2.instructions, p1.instructions)

        return [p12.writeList()]
    }

}
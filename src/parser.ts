export enum TokenType {
    Star = 'Star',
    Dot = 'Dot',
    Symbol = 'Symbol',
    Binder = 'Binder',
    Eof = 'Eof'
};

const Binders = ['and', 'to', 'through', 'becomes']
type Binders = typeof Binders[number]

export type Symbol = {
    name: string
    id: string
    props: string
}

type Token = {
    kind: TokenType
    line: number
    begin_column: number
    end_column: number
    value?: string
    symbol?: Symbol
}

export class Lexer {
    private ichar: number = 0
    private line: number = 1
    private column: number = 1

    constructor(readonly text: string) { }

    private skipWhitespace() {
        while (this.ichar < this.text.length) {
            const char = this.text[this.ichar]
            if (char === ' ') {
                this.ichar += 1
                this.column += 1
                continue
            }
            if (char === '\n') {
                this.ichar += 1
                this.column = 1
                this.line += 1
                continue
            }
            break
        }
    }

    nextToken(): Token | undefined {
        this.skipWhitespace()

        if (this.ichar > this.text.length) {
            return undefined
        }

        if (this.ichar === this.text.length) {
            return {
                kind: TokenType.Eof,
                line: this.line,
                begin_column: this.column,
                end_column: this.column,
                value: ''
            }
        }

        if (this.text[this.ichar] === '*') {
            this.ichar += 1
            this.column += 1
            return {
                kind: TokenType.Star,
                line: this.line,
                begin_column: this.column - 1,
                end_column: this.column,
                value: '*'
            }
        }


        if (this.text[this.ichar] === '.') {
            this.ichar += 1
            this.column += 1
            return {
                kind: TokenType.Dot,
                line: this.line,
                begin_column: this.column - 1,
                end_column: this.column,
                value: '.'
            }
        }


        let column = this.column
        for (let binder of Binders) {
            if (this.text.startsWith(binder, this.ichar)) {
                this.column += binder.length
                this.ichar += binder.length

                return {
                    kind: TokenType.Binder,
                    line: this.line,
                    begin_column: column,
                    end_column: this.column,
                    value: binder
                }
            }
        }


        let name = ''
        while (this.ichar < this.text.length) {
            let char = this.text[this.ichar]!
            if (!isNaN(parseInt(char))) {
                break
            }
            if (char === '_') {
                break
            }
            if (char === ' ' || char === '\n') {
                break
            }
            name += char
            this.ichar += 1
            this.column += 1
        }

        let id = ''
        while (this.ichar < this.text.length) {
            let char = this.text[this.ichar]!
            if (isNaN(parseInt(char))) {
                break
            }
            id += char
            this.ichar += 1
            this.column += 1
        }

        let props = ''
        if (this.ichar < this.text.length && this.text[this.ichar] === '_') {
            this.ichar += 1
            this.column += 1

            while (this.ichar < this.text.length) {
                let char = this.text[this.ichar]!
                if (char === ' ' || char === '\n') {
                    break
                }
                props += char
                this.ichar += 1
                this.column += 1
            }
        }


        return {
            kind: TokenType.Symbol,
            line: this.line,
            begin_column: column,
            end_column: this.column,
            value: '',
            symbol: {
                id,
                name,
                props
            }
        }
    }
}


export type Instruction = {
    from: Token
    action: Token
    to: Token
    and?: Token
    becomes?: Token
}

export class Parser {

    private lines: Map<number, Token[]>
    private line: number

    constructor(text: string) {
        this.line = 1
        this.lines = new Map()
        let lexer = new Lexer(text)

        while (true) {
            const next = lexer.nextToken()
            if (!next || next.kind === TokenType.Eof) {
                break
            }

            if (!this.lines.has(next.line)) {
                this.lines.set(next.line, [next])
            } else {
                this.lines.get(next.line)!.push(next)
            }
        }
    }


    parse() {
        let result: Instruction[] = []
        while (true) {
            let line = this.parseLine()
            if (!line) {
                break
            }
            result.push(line)
            this.line += 1
        }
        return result
    }

    private parseLine(): Instruction | undefined {
        let line = this.lines.get(this.line)

        if (!line) {
            return undefined
        }

        if (line[0]!.kind === TokenType.Symbol) {
            return this.beginSymbol(line[0]!)
        } else if (line[0]!.kind === TokenType.Dot) {
            return this.beginDot(line[0]!)
        }
    }

    private getNextTokenAfter(line: number, column: number) {
        let tokens = this.lines.get(line)!

        for (let token of tokens) {
            if (token.begin_column >= column) {
                return token
            }
        }
    }

    private getTokenBetween(line: number, column: number) {
        let tokens = this.lines.get(line)!

        for (let token of tokens) {
            if (token.begin_column <= column && token.end_column > column) {
                return token
            }
        }
    }


    private getTokenLastBecomes(line: number) {
        let tokens = this.lines.get(line)!

        return tokens[tokens.length - 1]
    }



    private eatDotOrStar(line: number, column: number) {
        let dot = this.getNextTokenAfter(line, column)
        if (!dot) {
            throw `expecting token after symbol ${line} ${column}`
        }
        if (dot.kind === TokenType.Dot || dot.kind === TokenType.Star) {
            return dot
        }
        throw `expecting dot or star after symbol ${line} ${column}`
    }
    private eatOptionalBinder(line: number, column: number) {
        let binder = this.getNextTokenAfter(line, column)
        if (!binder) {
            return undefined
        }
        if (binder.kind === TokenType.Binder) {
            return binder
        }
        return undefined
    }

    private eatOptionalBecomes(line: number, column: number) {
        let dot = this.getNextTokenAfter(line, column)
        if (!dot) {
            return undefined
        }
        if (dot.kind !== TokenType.Dot && dot.kind !== TokenType.Star) {
            return undefined
        }

        let binder = this.getNextTokenAfter(dot.line, dot.end_column)
        if (!binder) {
            return undefined
        }
        if (binder.kind === TokenType.Binder) {
            if (binder.value === 'becomes') {
                return binder
            }
        }
        return undefined
    }




    private beginSymbol(token: Token): Instruction {
        let from = token.symbol
        let dot = this.eatDotOrStar(token.line, token.end_column)
        let action = this.getNextTokenAfter(dot.line, dot.end_column)
        if (!action || action.kind !== TokenType.Symbol) {
            throw `expecting symbol after ${dot.kind === TokenType.Dot ? 'dot' : 'star'} Line:${dot.line} Column:${dot.end_column}`
        }

        let to = this.getNextTokenAfter(action.line, action.end_column)

        if (!to || to.kind !== TokenType.Symbol) {
            throw `expecting symbol after action Line:${action.line} Column:${action.begin_column}`
        }

        let binder = this.eatOptionalBinder(to.line, to.end_column)
        let and = binder ? this.getNextTokenAfter(binder.line, binder.end_column) : undefined

        let next = and ?? to

        let becomes_binder = this.eatOptionalBecomes(next.line, next.end_column)

        let becomes = becomes_binder ? this.getNextTokenAfter(becomes_binder.line, becomes_binder.end_column) : undefined

        return {
            from: token,
            action,
            to,
            and,
            becomes,
        }
    }

    private beginDot(dot: Token) {
        for (let line = dot.line - 1; line >= 0; line--) {
            let between = this.getTokenBetween(line, dot.begin_column)

            if (between && between.kind === TokenType.Star) {
                let from = this.getTokenLastBecomes(line)
                let action = this.getNextTokenAfter(dot.line, dot.end_column)
                if (!action || action.kind !== TokenType.Symbol) {
                    throw `expecting symbol after ${dot.kind === TokenType.Dot ? 'dot' : 'star'} Line:${dot.line} Column:${dot.end_column}`
                }


                let to = this.getNextTokenAfter(action.line, action.end_column)

                if (!to || to.kind !== TokenType.Symbol) {
                    throw `expecting symbol after action Line:${action.line} Column:${action.begin_column}`
                }

                let binder = this.eatOptionalBinder(to.line, to.end_column)
                let and = binder ? this.getNextTokenAfter(binder.line, binder.end_column) : undefined

                let next = and ?? to

                let becomes_binder = this.eatOptionalBecomes(next.line, next.end_column)

                let becomes = becomes_binder ? this.getNextTokenAfter(becomes_binder.line, becomes_binder.end_column) : undefined

                return {
                    from,
                    action,
                    to,
                    and,
                    becomes,
                }
            }

            if (between && between.kind === TokenType.Symbol) {
                let from = between
                let action = this.getNextTokenAfter(dot.line, dot.end_column)
                if (!action || action.kind !== TokenType.Symbol) {
                    throw `expecting symbol after ${dot.kind === TokenType.Dot ? 'dot' : 'star'} Line:${dot.line} Column:${dot.end_column}`
                }


                let to = this.getNextTokenAfter(action.line, action.end_column)

                if (!to || to.kind !== TokenType.Symbol) {
                    throw `expecting symbol after action Line:${action.line} Column:${action.begin_column}`
                }

                let binder = this.eatOptionalBinder(to.line, to.end_column)
                let and = binder ? this.getNextTokenAfter(binder.line, binder.end_column) : undefined

                let next = and ?? to

                let becomes_binder = this.eatOptionalBecomes(next.line, next.end_column)

                let becomes = becomes_binder ? this.getNextTokenAfter(becomes_binder.line, becomes_binder.end_column) : undefined

                return {
                    from,
                    action,
                    to,
                    and,
                    becomes,
                }
            }
        }
    }
}
import { it, expect } from 'vitest'
import { Lexer, Parser, TokenType } from './parser.js'


it('works', () => {

    let lexer = new Lexer(`
bishop *Captures king_t *becomes bishop23
`)

    expect(lexer.nextToken()!.symbol!.name).toBe('bishop')
    expect(lexer.nextToken()!.kind).toBe(TokenType.Star)
    expect(lexer.nextToken()!.symbol!.name).toBe('Captures')
    expect(lexer.nextToken()!.symbol!.props).toBe('t')
    lexer.nextToken()
    lexer.nextToken()
    expect(lexer.nextToken()!.symbol!.id).toBe('23')

})


it('parses', () => {

    let parser = new Parser('bishop *Captures king2 *becomes bishop81')
    let res = parser.parse()

    expect(res.length).toBe(1)

})
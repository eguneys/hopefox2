import { it, expect } from 'vitest'
import { Lexer, Parser, TokenType } from './parser.js'


it('basic usage', () => {

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


it('*Captures *becomes', () => {

    let parser = new Parser('bishop *Captures king2 *becomes bishop81')
    let res = parser.parse()

    expect(res.length).toBe(1)

})


it('*Forks *and', () => {

    let parser = new Parser('knight_t *Forks king_o *and queen_o *becomes knight2')
    let res = parser.parse()

    expect(res.length).toBe(1)

    expect(res[0].action.symbol!.name).toEqual('Forks')
    expect(res[0].and).toBeDefined()
    expect(res[0].and!.symbol!.name).toEqual('queen')

})

it('*EvadesTo *becomes', () => {

    let parser = new Parser('king *EvadesTo sq *becomes king2')
    let res = parser.parse()

    expect(res.length).toBe(1)

    expect(res[0].action.symbol!.name).toEqual('EvadesTo')
    expect(res[0].becomes).toBeDefined()

})


it('.notAttacked beginDot', () => {

    let parser = new Parser(`
queen_t *Checks king_o *becomes queen2
                                  .notAttacked
`.trim())
    let res = parser.parse()

    expect(res.length).toBe(2)

    expect(res[1].action.symbol!.name).toEqual('notAttacked')
    expect(res[1].to).toBeUndefined()
    expect(res[1].from.symbol.name).toEqual('queen')

})
import { it, expect } from 'vitest'
import { ScriptRunner } from './runner.js'
import { DebugParser } from './types.js'

it('knight fork only', () => {


        expectScriptPreview(`
knight_t *Forks king_o *and queen_o *becomes knight2
king *EvadesTo sq *becomes king2
knight2 *Captures queen *becomes knight2
`,
                `
.....bk.
.....ppp
..q...N.
........
........
........
........
......K.
`,
                `
1: {Ne7+}
2: {Ne7+ Kh8}
3: {Ne7+ Kh8 Nxc6}
`)


})



it('backrank mate', () => {


        expectScriptPreview(`
rook_t *Checks king_o *becomes rook2
rook3_t *Blocks Check *becomes rook4
rook2 *Captures rook4 *becomes rook5
`,
                `
......k.
......p.
....r...
........
........
..R.....
........
......K.
`,
                `
1: {Rc8+}
2: {Rc8+ Re8}
3: {Rc8+ Re8 Rxe8+}
`)


})


function expectScriptPreview(script: string, position: string, expected: string) {
        let runner = ScriptRunner.parse(script.trim())

        let { moves, preview } = runner.runOnPosition(DebugParser.Position(position.trim()))

        expect(preview).toEqual(expected.trim())
}
import { expect, it } from "vitest";
import { ScriptRunner } from "./runner.js";
import { ScriptBinder, ScriptWriter } from "./binder.js";

it('only basic usage', () => {

    const a_gof = `
rook_o .hanging
bishop_t *Captures knight_o *becomes bishop2
bishop3_t *Captures bishop2 *becomes bishop4
          .hanging
`.trim()

    const b_gof = `
bishop_o .hanging
knight_t *Forks queen_o *and bishop *becomes knight2
queen *SingleSafeDefendFor bishop *becomes queen2
    `.trim()



    const c_gof_a = `
rook_o .hanging
bishop_t *Captures knight_o *becomes bishop2
bishop3_t *Captures bishop2 *becomes bishop4
          .hanging
knight2_t *Forks queen_o *and bishop4 *becomes knight3
queen *SingleSafeDefendFor bishop4 *becomes queen2
`.trim()


    const c_gof_b = `
rook_o .hanging
bishop_t *Captures knight_o *becomes bishop2
bishop3_t *Captures bishop2 *becomes bishop4
          .hanging
bishop5_o .hanging
knight2_t *Forks queen_o *and bishop5 *becomes knight3
queen *SingleSafeDefendFor bishop5 *becomes queen2
`.trim()



    const a1 = ScriptRunner.parse(a_gof).instructions
    const b1 = ScriptRunner.parse(b_gof).instructions
    const c1s = ScriptBinder.bindInstructions(a1, b1)


    expect(ScriptWriter.write(a1)).toBe(a_gof)
    expect(ScriptWriter.write(b1)).toBe(b_gof)

    expect(c1s.length).toBe(2)

    expect(ScriptWriter.write(c1s[0])).toBe(c_gof_a)
    expect(ScriptWriter.write(c1s[1])).toBe(c_gof_b)

})
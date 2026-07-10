import { expect, it } from "vitest";
import { ScriptRunner } from "./runner.js";
import { ScriptBinder, ScriptWriter } from "./binder.js";

it('basic usage', () => {

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

    //expect(c1s.length).toBe(2)

    expect(ScriptWriter.write(c1s[0])).toBe(c_gof_a)
    expect(ScriptWriter.write(c1s[1])).toBe(c_gof_b)

})



it('basic usage 2', () => {

    const a_gof = `
pawn_o .onlyDefendedBy pawn2_o
bishop_t .eyesThrough king_o .and pawn2
queen_t *Captures pawn *becomes queen2
king_t *SingleSafeEvadeTo sq *becomes king2
`.trim()

    const b_gof = `
queen_t *Captures pawn_o *becomes queen2
        .Checks king_t
        .noSafeEvadableFor king
        .noSafeCapturable
        .isUnblockableFor king
    `.trim()



    const c_gof_a = `
pawn_o .onlyDefendedBy pawn2_o
bishop_t .eyesThrough king_o .and pawn2
queen_t *Captures pawn *becomes queen2
king_t *SingleSafeEvadeTo sq *becomes king2
queen2 *Captures pawn2_o *becomes queen3
       .Checks king2
       .noSafeEvadableFor king2
       .noSafeCapturable
       .isUnblockableFor king2
`.trim()


    const a1 = ScriptRunner.parse(a_gof).instructions
    const b1 = ScriptRunner.parse(b_gof).instructions
    const c1s = ScriptBinder.bindInstructions(a1, b1)


    expect(ScriptWriter.write(a1)).toBe(a_gof)
    expect(ScriptWriter.write(b1)).toBe(b_gof)

    expect(c1s.length).toBeGreaterThan(0)

    expect(ScriptWriter.write(c1s[0])).toBe(c_gof_a)

})




it('basic usage 3', () => {

    const a_gof = `
bishop_t .eyesThrough king_o .and pawn4_o
queen_t *Captures pawn_o *becomes queen2
        .Checks king_t
        .isUnblockableFor king
pawn2_t *Captures queen2 *becomes pawn3
        .onlyDefendedBy pawn4
rook_t *Captures pawn5_o *becomes rook2
       .Checks king2_t
king2 *SingleSafeEvadeTo sq *becomes king3
rook3_t *Checks king3 *becomes rook4
        .notAttacked
        .noSafeEvadableFor king3
knight_t *Blocks Check *becomes knight2
`.trim()

    const b_gof = `
rook_t *Captures knight_o *becomes rook2
       .Checks king_t
       .noSafeCapturable
       .noSafeEvadableFor king
    `.trim()

    const c_gof_a = `
bishop_t .eyesThrough king_o .and pawn4_o
queen_t *Captures pawn_o *becomes queen2
        .Checks king_t
        .isUnblockableFor king
pawn2_t *Captures queen2 *becomes pawn3
        .onlyDefendedBy pawn4
rook_t *Captures pawn5_o *becomes rook2
       .Checks king2_t
king2 *SingleSafeEvadeTo sq *becomes king3
rook3_t *Checks king3 *becomes rook4
        .notAttacked
        .noSafeEvadableFor king3
knight_t *Blocks Check *becomes knight2
rook4 *Captures knight2 *becomes rook5
      .Checks king3
      .noSafeCapturable
      .noSafeEvadableFor king3
`.trim()


    const a1 = ScriptRunner.parse(a_gof).instructions
    const b1 = ScriptRunner.parse(b_gof).instructions
    const c1s = ScriptBinder.bindInstructions(a1, b1)


    expect(ScriptWriter.write(a1)).toBe(a_gof)
    expect(ScriptWriter.write(b1)).toBe(b_gof)

    expect(c1s.length).toBeGreaterThan(0)

    expect(ScriptWriter.write(c1s[7])).toBe(c_gof_a)

})
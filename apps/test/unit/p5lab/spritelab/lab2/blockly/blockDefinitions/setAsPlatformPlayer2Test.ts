import {parse} from 'acorn';

import {
  JUMP_SPEED,
  PLAYER_2_GROUP,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/makePlatformPlayer';
import setAsPlatformPlayer2 from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setAsPlatformPlayer2';
import thePlayer2 from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/thePlayer2';

describe('set as player 2', () => {
  it('promotes the costume to the second player group', () => {
    // The costume field holds its name as a JSON literal.
    const block = {
      getFieldValue: (name: string) =>
        name === 'ANIMATION_NAME' ? '"cat"' : '',
    } as unknown as Parameters<typeof setAsPlatformPlayer2.generator>[0];
    expect(
      setAsPlatformPlayer2.generator(
        block,
        {} as Parameters<typeof setAsPlatformPlayer2.generator>[1]
      )
    ).toBe('setAsPlatformPlayer2({costume: "cat"});\n');
  });

  it("wires W, A, S and D to its own group, with the first player's jump", () => {
    const code = setAsPlatformPlayer2.helperCode;
    expect(() => parse(code, {ecmaVersion: 5})).not.toThrow();
    expect(code).toContain(`setPlatformPlayer(spriteArg, "${PLAYER_2_GROUP}")`);
    for (const key of ['a', 'd', 'w', 's']) {
      expect(code).toContain(`keyPressed('while', '${key}'`);
    }
    expect(code).toContain(`keyPressed('when', 'w'`);
    expect(code).toContain(`platformJump(${JUMP_SPEED}, "${PLAYER_2_GROUP}")`);
    // Nothing of the arrow-key player's.
    expect(code).not.toContain("'left'");
    expect(code).not.toContain("'players'}");
  });

  it('has a reference block for player 2', () => {
    expect(
      thePlayer2.generator(
        {} as Parameters<typeof thePlayer2.generator>[0],
        {} as Parameters<typeof thePlayer2.generator>[1]
      )
    ).toEqual([`{group: "${PLAYER_2_GROUP}"}`, expect.anything()]);
  });
});

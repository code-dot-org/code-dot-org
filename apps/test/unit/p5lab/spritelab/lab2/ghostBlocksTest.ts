import {ownsTop} from '@cdo/apps/p5lab/spritelab/lab2/addBlocks';
import {
  asPlaceholders,
  ghostTag,
  isGhostStack,
  tagged,
  withoutGhosts,
} from '@cdo/apps/p5lab/spritelab/lab2/ghostBlocks';

const AT_TIME_SAY = {
  type: 'gamelab_atTime',
  inputs: {
    N: {shadow: {type: 'math_number', fields: {NUM: 3}}},
    DO: {block: {type: 'gamelab_spriteSay', fields: {SPEECH: 'Hi!'}}},
  },
  next: {block: {type: 'spritelab2_restartScene'}},
};

describe('ghost stacks', () => {
  it('tells a ghost entry from the other starter blocks', () => {
    expect(isGhostStack({ghost: AT_TIME_SAY, data: 'later'})).toBe(true);
    expect(isGhostStack(AT_TIME_SAY)).toBe(false);
    expect(isGhostStack({attachTo: 'spritelab2_whenRun', shadow: {}})).toBe(
      false
    );
  });

  it('tags every real block of the stack and leaves the shadows alone', () => {
    const tag = ghostTag('later');
    const out = tagged(AT_TIME_SAY, tag);
    expect(out.data).toBe(tag);
    expect(out.inputs?.N.shadow).toEqual(AT_TIME_SAY.inputs.N.shadow);
    expect(out.inputs?.DO.block?.data).toBe(tag);
    expect(out.next?.block?.data).toBe(tag);
    expect(AT_TIME_SAY).not.toHaveProperty('data');
  });

  it('draws the stack as a chain of placeholders sized like its blocks', () => {
    const out = asPlaceholders(tagged(AT_TIME_SAY, 'ghost:later'));
    expect(out.type).toBe('spritelab2_placeholder');
    expect(out.data).toBe('ghost:later');
    const like = (out.extraState as {like: {type: string; next?: unknown}})
      .like;
    expect(like.type).toBe('gamelab_atTime');
    expect(like.next).toBeUndefined();
    expect(out.next?.block?.type).toBe('spritelab2_placeholder');
    expect(
      (out.next?.block?.extraState as {like: {type: string}}).like.type
    ).toBe('spritelab2_restartScene');
  });

  it('claims the tops a level has the student build', () => {
    const entries = [
      {ghost: AT_TIME_SAY, data: 'at-6', tagged: true},
      {type: 'gamelab_checkTouching', data: 'treasure-touch'},
      {
        attachTo: 'spritelab2_whenRun',
        shadow: {type: 'spritelab2_placeholder'},
      },
    ];
    expect(ownsTop(entries, {type: 'gamelab_atTime', data: 'at-6'})).toBe(true);
    expect(ownsTop(entries, {type: 'gamelab_atTime', data: 'at-3'})).toBe(
      false
    );
    expect(
      ownsTop(entries, {type: 'gamelab_checkTouching', data: 'treasure-touch'})
    ).toBe(true);
    expect(ownsTop(entries, {type: 'spritelab2_whenRun'})).toBe(false);
  });

  it('leaves the ghosts out of a save and keeps the rest', () => {
    const source = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {type: 'spritelab2_whenRun'},
          tagged(AT_TIME_SAY, ghostTag('later')),
          {type: 'gamelab_atTime', data: 'at-3'},
        ],
      },
    };
    expect(withoutGhosts(source).blocks.blocks.map(b => b.data)).toEqual([
      undefined,
      'at-3',
    ]);
    const plain = {blocks: {languageVersion: 0, blocks: [{type: 'x'}]}};
    expect(withoutGhosts(plain)).toBe(plain);
  });
});

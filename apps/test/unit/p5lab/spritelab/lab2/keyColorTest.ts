import {
  chooseKeyColor,
  KEY_COLORS,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/keyColor';

describe('SpriteLab2 chooseKeyColor', () => {
  it('defaults to magenta', () => {
    expect(chooseKeyColor('a brick monster')).toBe(KEY_COLORS.magenta);
    expect(chooseKeyColor('')).toBe(KEY_COLORS.magenta);
  });

  it('keys on green for a pink or purple character', () => {
    expect(chooseKeyColor('a pink unicorn')).toBe(KEY_COLORS.green);
    expect(chooseKeyColor('a Purple Princess')).toBe(KEY_COLORS.green);
  });

  it('keeps magenta for a green character', () => {
    expect(chooseKeyColor('a frog')).toBe(KEY_COLORS.magenta);
    expect(chooseKeyColor('a green knight')).toBe(KEY_COLORS.magenta);
  });

  it('picks whichever colour the prompt mentions less', () => {
    expect(chooseKeyColor('a pink frog with a green hat')).toBe(
      KEY_COLORS.magenta
    );
    expect(chooseKeyColor('a purple and pink dragon')).toBe(KEY_COLORS.green);
  });
});

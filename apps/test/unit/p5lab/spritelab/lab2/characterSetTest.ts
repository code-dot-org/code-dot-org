import {
  CHARACTER_SET_PICTURE_COUNT,
  basePrompt,
  posePrompt,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {KEY_COLORS} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/keyColor';

const key = KEY_COLORS.magenta;

describe('SpriteLab2 characterSet', () => {
  it('costs the base picture plus one per posed frame', () => {
    expect(CHARACTER_SET_PICTURE_COUNT).toBe(4);
  });

  it('the base prompt asks for the whole character on the key color', () => {
    const text = basePrompt('a knight', 'smooth', key);
    expect(text).toContain('a knight');
    expect(text).toContain('facing right');
    expect(text).toContain(key.name);
    expect(text).toContain(key.hex);
  });

  it('a pose prompt holds the character to its size and position', () => {
    const text = posePrompt(
      'a knight',
      {label: 'walking', pose: 'halfway through a walking stride'},
      'pixel',
      key
    );
    expect(text).toContain('provided image');
    expect(text).toContain('halfway through a walking stride');
    expect(text).toContain('same size and position');
    expect(text).toContain(key.name);
  });
});

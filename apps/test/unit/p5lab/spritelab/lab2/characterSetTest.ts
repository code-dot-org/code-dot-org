import {
  CHARACTER_SET_PICTURE_COUNT,
  basePrompt,
  posePrompt,
  posedFrames,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {pixelBlockFor} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {KEY_COLORS} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/keyColor';

const key = KEY_COLORS.magenta;

describe('SpriteLab2 characterSet', () => {
  it('costs the base picture plus one per posed frame', () => {
    expect(CHARACTER_SET_PICTURE_COUNT).toBe(5);
  });

  it('the base prompt asks for the whole character on the key color', () => {
    const text = basePrompt('a knight', 'smooth', key, pixelBlockFor('sprite'));
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
      key,
      pixelBlockFor('sprite')
    );
    expect(text).toContain('provided image');
    expect(text).toContain('halfway through a walking stride');
    expect(text).toContain('same size and position');
    expect(text).toContain(key.name);
  });

  it('passes a chosen pixel block into both frame prompts', () => {
    expect(basePrompt('a knight', 'pixel', key, 32)).toContain(
      '32x32 pixel grid'
    );
    expect(
      posePrompt(
        'a knight',
        {label: 'walking', pose: 'halfway through a walking stride'},
        'pixel',
        key,
        32
      )
    ).toContain('32x32 pixel grid');
  });

  it('draws an animal on four legs when the body plan says so', () => {
    const upright = basePrompt('A grumpy cat', 'smooth', key, 1);
    const animal = basePrompt('A grumpy cat', 'smooth', key, 1, 'quadruped');
    expect(upright).toContain('Arms hanging relaxed');
    expect(animal).toContain('all four legs');
    expect(animal).toContain('no arms or hands');
    expect(animal).not.toContain('Arms hanging relaxed');
  });

  it('poses every body plan through the same four frames', () => {
    for (const plan of ['upright', 'quadruped', 'bird'] as const) {
      expect(posedFrames(plan).map(f => f.label)).toEqual([
        'idling',
        'walking',
        'jumping',
        'landing',
      ]);
    }
    expect(posedFrames('quadruped')[1].pose).toContain('four legs');
    expect(posedFrames('bird')[1].pose).toContain('wings');
    expect(posedFrames()).toBe(posedFrames('upright'));
  });
});

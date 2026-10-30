import {
  createPlayerSounds,
  PlayerSoundEvent,
} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/playerSounds';

import {fakeAudioContext} from './fakeAudioContext';

const EVENTS: PlayerSoundEvent[] = ['step', 'blocked'];

const build = () => {
  const {context, voices, asAudioContext} = fakeAudioContext();
  const sounds = createPlayerSounds(asAudioContext());
  return {context, voices, sounds};
};

describe('SpriteLab2 playerSounds', () => {
  it('sweeps a blip for every event', () => {
    const {voices, sounds} = build();
    EVENTS.forEach(event => sounds.play(event));
    expect(voices).toHaveLength(EVENTS.length);
    expect(voices.every(voice => voice.hz > 0 && voice.sweeps[0].to > 0)).toBe(
      true
    );
  });

  it('keeps every sweep where a laptop speaker can reproduce it', () => {
    const {voices, sounds} = build();
    EVENTS.forEach(event => sounds.play(event));
    voices.forEach(voice => {
      expect(Math.min(voice.hz, voice.sweeps[0].to)).toBeGreaterThanOrEqual(
        120
      );
      expect(Math.max(voice.hz, voice.sweeps[0].to)).toBeLessThanOrEqual(1000);
    });
  });

  it('buzzes only for the wall, and louder than a footfall', () => {
    const {voices, sounds} = build();
    sounds.play('step');
    sounds.play('blocked');
    const [step, blocked] = voices;
    expect(blocked.type).toBe('sawtooth');
    expect(step.type).not.toBe('sawtooth');
    expect(blocked.peaks[0].to).toBeGreaterThan(step.peaks[0].to);
  });

  it('alternates feet, so walking reads as a gait', () => {
    const {voices, sounds} = build();
    sounds.play('step');
    sounds.play('step');
    sounds.play('step');
    expect(voices[0].hz).not.toBeCloseTo(voices[1].hz);
    expect(voices[0].hz).toBeCloseTo(voices[2].hz);
  });

  it('resumes a context the browser suspended', () => {
    const {context, sounds} = build();
    sounds.play('step');
    expect(context.resumed).toBe(1);
  });

  it('goes quiet once stopped', () => {
    const {voices, sounds} = build();
    sounds.stop();
    EVENTS.forEach(event => sounds.play(event));
    expect(voices).toHaveLength(0);
  });
});

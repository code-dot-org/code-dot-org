import {
  createHeightTone,
  heightPitch,
} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/heightTone';

import {fakeAudioContext} from './fakeAudioContext';

const build = () => {
  const {context, voices, asAudioContext} = fakeAudioContext();
  const tone = createHeightTone(asAudioContext());
  return {context, tone, voice: voices[0], voices};
};

const pitch = (voice: {glides: number[]; hz: number}) =>
  voice.glides.length ? voice.glides[voice.glides.length - 1] : voice.hz;
const level = (voice: {levels: number[]}) =>
  voice.levels[voice.levels.length - 1];

describe('SpriteLab2 heightTone', () => {
  describe('heightPitch', () => {
    it('rises with the player', () => {
      expect(heightPitch(1)).toBeGreaterThan(heightPitch(0.5));
      expect(heightPitch(0.5)).toBeGreaterThan(heightPitch(0));
    });

    it('spans two octaves, floor to ceiling', () => {
      expect(heightPitch(1) / heightPitch(0)).toBeCloseTo(4);
    });

    it('climbs by interval, not by hertz', () => {
      // Halfway up is the middle by ratio, not by hertz.
      const low = heightPitch(0);
      const high = heightPitch(1);
      expect(heightPitch(0.5)).toBeCloseTo(Math.sqrt(low * high));
      expect(heightPitch(0.5)).toBeLessThan((low + high) / 2);
    });

    it('puts the floor at 0 and the top at 1', () => {
      // The engine measures from the feet, so standing on the floor is 0
      // whatever the costume's height.
      expect(heightPitch(0)).toBeLessThan(heightPitch(0.01));
      expect(heightPitch(1)).toBeGreaterThan(heightPitch(0.99));
    });

    it('clamps outside the view rather than running away', () => {
      // A jump can carry above the top of the screen.
      expect(heightPitch(5)).toBe(heightPitch(1));
      expect(heightPitch(-5)).toBe(heightPitch(0));
    });
  });

  describe('createHeightTone', () => {
    it('is the one voice that slides, and holds a triangle', () => {
      const {voices, voice} = build();
      expect(voices).toHaveLength(1);
      expect(voice.type).toBe('triangle');
    });

    it('starts silent, before the player has moved', () => {
      const {voice} = build();
      expect(voice.levels).toHaveLength(0);
    });

    it('resumes a context the browser suspended', () => {
      const {context, tone} = build();
      tone.update({above: 0.5, airborne: true});
      expect(context.resumed).toBe(1);
    });

    it('sounds only off the ground', () => {
      const {tone, voice} = build();
      tone.update({above: 0.2, airborne: false});
      expect(level(voice)).toBe(0);
      tone.update({above: 0.4, airborne: true});
      expect(level(voice)).toBeGreaterThan(0);
    });

    it('tracks the pitch on the ground too, silently', () => {
      // So a jump opens on the note of the ledge it left.
      const {tone, voice} = build();
      tone.update({above: 0.1, airborne: false});
      const low = pitch(voice);
      tone.update({above: 0.8, airborne: false});
      expect(pitch(voice)).toBeGreaterThan(low);
      expect(level(voice)).toBe(0);
    });

    it('comes back to its takeoff note when the jump lands where it left', () => {
      const {tone, voice} = build();
      tone.update({above: 0.3, airborne: false});
      const takeoff = pitch(voice);
      tone.update({above: 0.6, airborne: true});
      expect(pitch(voice)).toBeGreaterThan(takeoff);
      tone.update({above: 0.3, airborne: false});
      expect(pitch(voice)).toBeCloseTo(takeoff);
    });

    it('ends lower than it began when the player falls a ledge', () => {
      const {tone, voice} = build();
      tone.update({above: 0.5, airborne: false});
      const takeoff = pitch(voice);
      tone.update({above: 0.45, airborne: true});
      tone.update({above: 0.2, airborne: false});
      expect(pitch(voice)).toBeLessThan(takeoff);
    });

    it('releases more slowly than it attacks, so the last note is heard', () => {
      const {tone, voice} = build();
      tone.update({above: 0.5, airborne: true});
      tone.update({above: 0.5, airborne: false});
      const [attack, release] = voice.taus;
      expect(release).toBeGreaterThan(attack);
    });

    it('goes quiet and stays quiet once stopped', () => {
      const {tone, voice} = build();
      tone.update({above: 0.5, airborne: true});
      const heard = voice.levels.length;
      tone.stop();
      expect(voice.stopped).toBe(true);

      tone.update({above: 0.9, airborne: true});
      expect(voice.levels).toHaveLength(heard);
    });
  });
});

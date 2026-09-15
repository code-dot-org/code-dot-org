import {
  createProximityAudio,
  PROXIMITY_RANGE,
  proximityLevel,
} from '@cdo/apps/p5lab/spritelab/lab2/proximityAudio';

import {fakeAudioContext} from './fakeAudioContext';

const build = () => {
  const {context, voices, asAudioContext} = fakeAudioContext();
  const audio = createProximityAudio(asAudioContext());
  return {context, audio, voices, wall: voices[0], edge: voices[1]};
};

describe('SpriteLab2 proximityAudio', () => {
  describe('proximityLevel', () => {
    it('is silent with no hazard ahead', () => {
      expect(proximityLevel(Infinity)).toBe(0);
      expect(proximityLevel(NaN)).toBe(0);
    });

    it('is silent beyond the range and at its edge', () => {
      expect(proximityLevel(PROXIMITY_RANGE)).toBe(0);
      expect(proximityLevel(PROXIMITY_RANGE + 1)).toBe(0);
    });

    it('is loudest on contact', () => {
      expect(proximityLevel(0)).toBe(1);
      // Past the face is no louder than touching it.
      expect(proximityLevel(-5)).toBe(1);
    });

    it('stays quiet until close, rather than fading in evenly', () => {
      // Squared, so halfway there is a quarter of the volume.
      expect(proximityLevel(20)).toBeGreaterThan(proximityLevel(80));
      expect(proximityLevel(PROXIMITY_RANGE / 2)).toBeCloseTo(0.25);
    });
  });

  describe('createProximityAudio', () => {
    it('holds the edge a fifth above the wall, both on sine', () => {
      // A sliding note means height; these sit still, and sound different.
      const {voices, wall, edge} = build();
      expect(voices).toHaveLength(2);
      expect(edge.hz / wall.hz).toBeCloseTo(1.5, 1);
      expect(wall.type).toBe('sine');
      expect(edge.type).toBe('sine');
    });

    it('starts silent, before any distance is known', () => {
      const {wall, edge} = build();
      expect(wall.levels).toHaveLength(0);
      expect(edge.levels).toHaveLength(0);
    });

    it('resumes a context the browser suspended', () => {
      const {context, audio} = build();
      audio.update({wall: 50, edge: Infinity});
      expect(context.resumed).toBe(1);
    });

    it('drives each voice from its own hazard, swelling as it nears', () => {
      const {audio, wall, edge} = build();
      audio.update({wall: 80, edge: Infinity});
      audio.update({wall: 10, edge: Infinity});
      expect(wall.levels[1]).toBeGreaterThan(wall.levels[0]);
      expect(edge.levels).toEqual([0, 0]);
    });

    it('stays quiet about a lip standing behind a wall', () => {
      // A wall at the end of a platform sits just before the edge, so
      // both come into range together — but you can't reach the drop.
      const {audio, wall, edge} = build();
      audio.update({wall: 40, edge: 90});
      expect(wall.levels[0]).toBeGreaterThan(0);
      expect(edge.levels[0]).toBe(0);
    });

    it('reports a drop that comes before the wall past it', () => {
      const {audio, edge} = build();
      audio.update({wall: 90, edge: 40});
      expect(edge.levels[0]).toBeGreaterThan(0);
    });

    it('goes quiet and stays quiet once stopped', () => {
      const {audio, voices, wall} = build();
      audio.update({wall: 0, edge: 0});
      const heard = wall.levels.length;
      audio.stop();
      expect(voices.every(voice => voice.stopped)).toBe(true);

      audio.update({wall: 0, edge: 0});
      expect(wall.levels).toHaveLength(heard);
    });
  });
});

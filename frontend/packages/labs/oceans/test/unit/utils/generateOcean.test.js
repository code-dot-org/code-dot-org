import {describe, it, expect, beforeEach} from 'vitest';

import {AppMode} from '../../../src/oceans/constants';
import {resetState, setState} from '../../../src/oceans/state';
import {initFishData} from '../../../src/utils/fishData';
import {generateOcean} from '../../../src/utils/generateOcean';

beforeEach(() => {
  resetState();
  setState({appMode: AppMode.FishVTrash, loadTrashImages: true});
  initFishData();
});

describe('generateOcean', () => {
  it('returns the requested number of objects', () => {
    const ocean = generateOcean(5, 0, true, true, false);
    expect(ocean).toHaveLength(5);
  });

  it('returns objects with a getTensor method', () => {
    const ocean = generateOcean(3, 0, true, false, false);
    ocean.forEach(obj => {
      expect(typeof obj.getTensor).toBe('function');
    });
  });

  it('assigns ids in the range [idStart, idStart+numFish)', () => {
    // generateOcean shuffles the output so the order is not deterministic;
    // verify only that all expected ids are present.
    const idStart = 10;
    const numFish = 4;
    const ocean = generateOcean(numFish, idStart, true, false, false);
    const ids = new Set(ocean.map(o => o.id));
    for (let i = idStart; i < idStart + numFish; i++) {
      expect(ids.has(i)).toBe(true);
    }
  });

  it('returns an empty array when numFish is 0', () => {
    expect(generateOcean(0)).toHaveLength(0);
  });
});

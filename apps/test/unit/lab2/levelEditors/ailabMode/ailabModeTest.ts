import {
  getUnknownKeys,
  isValidModeValue,
  parseMode,
  serializeMode,
  setModeValue,
  toggleDataset,
} from '@cdo/apps/lab2/levelEditors/ailabMode/ailabMode';

describe('ailabMode', () => {
  describe('parseMode', () => {
    it('treats a blank mode as empty', () => {
      expect(parseMode(null)).toEqual({});
      expect(parseMode('  \n')).toEqual({});
    });

    it('parses a JSON object', () => {
      expect(parseMode('{"hideSave": true}')).toEqual({hideSave: true});
    });

    it('returns null for invalid JSON or a non-object', () => {
      expect(parseMode("{'datasets': ['zoo']}")).toBeNull();
      expect(parseMode('["zoo"]')).toBeNull();
      expect(parseMode('"zoo"')).toBeNull();
    });
  });

  describe('serializeMode', () => {
    it('writes an empty mode as an empty string', () => {
      expect(serializeMode({})).toBe('');
    });

    it('pretty-prints with two spaces', () => {
      expect(serializeMode({hideSave: true})).toBe('{\n  "hideSave": true\n}');
    });
  });

  describe('setModeValue', () => {
    it('keeps the position of a replaced key', () => {
      const mode = setModeValue({a: 1, trainer: 'knn', b: 2}, 'trainer', 'x');
      expect(Object.keys(mode)).toEqual(['a', 'trainer', 'b']);
    });

    it('removes a key set to undefined', () => {
      expect(
        setModeValue({hideSave: true, a: 1}, 'hideSave', undefined)
      ).toEqual({a: 1});
    });
  });

  describe('isValidModeValue', () => {
    it('accepts valid values', () => {
      expect(isValidModeValue('datasets', ['zoo'])).toBe(true);
      expect(isValidModeValue('trainer', 'decisionTree')).toBe(true);
      expect(isValidModeValue('requireAccuracy', 80)).toBe(true);
      expect(isValidModeValue('hideSave', false)).toBe(true);
      expect(isValidModeValue('hideSave', undefined)).toBe(true);
    });

    it('rejects invalid values', () => {
      expect(isValidModeValue('datasets', 'zoo')).toBe(false);
      expect(isValidModeValue('trainer', 'svm')).toBe(false);
      expect(isValidModeValue('requireAccuracy', '80')).toBe(false);
      expect(isValidModeValue('requireAccuracy', 101)).toBe(false);
      expect(isValidModeValue('hideSave', 'true')).toBe(false);
    });
  });

  it('getUnknownKeys lists keys AI Lab does not read', () => {
    expect(
      getUnknownKeys({hideSave: true, hideModelCard: true, id: 3})
    ).toEqual(['hideModelCard', 'id']);
  });

  describe('toggleDataset', () => {
    it('adds and removes a dataset, keeping unrecognized IDs', () => {
      const added = toggleDataset({datasets: ['nope']}, 'zoo', true);
      expect(added.datasets).toEqual(['nope', 'zoo']);
      expect(toggleDataset(added, 'zoo', false).datasets).toEqual(['nope']);
    });

    it('removes the key when the last dataset is removed', () => {
      expect(toggleDataset({datasets: ['zoo'], a: 1}, 'zoo', false)).toEqual({
        a: 1,
      });
    });

    it('replaces an invalid datasets value', () => {
      expect(toggleDataset({datasets: 'zoo'}, 'heart', true).datasets).toEqual([
        'heart',
      ]);
    });
  });
});

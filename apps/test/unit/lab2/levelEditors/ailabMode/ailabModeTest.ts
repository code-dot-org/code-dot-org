import {
  getDatasetProblem,
  getModeSaveError,
  getSelectedDataset,
  getUnknownKeys,
  isValidModeValue,
  parseMode,
  serializeMode,
  setModeValue,
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
      expect(isValidModeValue('trainer', 'decisionTree')).toBe(true);
      expect(isValidModeValue('requireAccuracy', 80)).toBe(true);
      expect(isValidModeValue('hideSave', false)).toBe(true);
      expect(isValidModeValue('hideSave', undefined)).toBe(true);
    });

    it('rejects invalid values', () => {
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

  describe('dataset selection', () => {
    const KNOWN = ['zoo', 'heart'];

    it('selects a single known dataset', () => {
      expect(getSelectedDataset({datasets: ['zoo']}, KNOWN)).toBe('zoo');
      expect(getDatasetProblem({datasets: ['zoo']}, KNOWN)).toBeNull();
    });

    it('reports a missing dataset', () => {
      expect(getSelectedDataset({}, KNOWN)).toBeUndefined();
      expect(getDatasetProblem({}, KNOWN)).toMatch(/Choose a dataset/);
    });

    it('reports several datasets', () => {
      expect(getDatasetProblem({datasets: ['zoo', 'heart']}, KNOWN)).toMatch(
        /several datasets \(zoo, heart\)/
      );
    });

    it('reports an unknown or malformed value', () => {
      expect(getDatasetProblem({datasets: ['nope']}, KNOWN)).toMatch(
        /not a known dataset/
      );
      expect(getDatasetProblem({datasets: []}, KNOWN)).toMatch(
        /not a known dataset/
      );
      expect(getDatasetProblem({datasets: 'zoo'}, KNOWN)).toMatch(
        /not a known dataset/
      );
    });
  });

  describe('getModeSaveError', () => {
    it('allows a mode with one known dataset', () => {
      expect(getModeSaveError('{"datasets": ["zoo"]}', ['zoo'])).toBeNull();
    });

    it('blocks a mode without a dataset', () => {
      expect(getModeSaveError('', ['zoo'])).toMatch(/Choose a dataset/);
    });

    it('blocks a mode that is not a JSON object', () => {
      expect(getModeSaveError("{'datasets': ['zoo']}", ['zoo'])).toMatch(
        /valid JSON object/
      );
    });
  });
});

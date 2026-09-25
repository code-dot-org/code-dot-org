import {
  cleanMode,
  getSelectedDataset,
  parseMode,
  serializeMode,
  setModeValue,
  withDefaultTrainer,
} from '@cdo/apps/lab2/levelEditors/ailabMode/ailabMode';

const KNOWN = ['zoo', 'heart'];

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

  describe('cleanMode', () => {
    it('keeps valid values in their original order', () => {
      const mode = {
        trainer: 'decisionTree',
        datasets: ['zoo'],
        requireAccuracy: 80,
        hideSave: false,
      };
      expect(cleanMode(mode, KNOWN)).toEqual({mode, removed: []});
    });

    it('drops unknown keys and invalid values', () => {
      const {mode, removed} = cleanMode(
        {
          hideSave: true,
          hideModelCard: true,
          hideInstructionsOverlay: true,
          trainer: 'svm',
          requireAccuracy: '80',
          hideSelectLabel: 'yes',
        },
        KNOWN
      );
      expect(mode).toEqual({hideSave: true});
      expect(removed).toEqual([
        'hideModelCard: true',
        'hideInstructionsOverlay: true',
        'trainer: "svm"',
        'requireAccuracy: "80"',
        'hideSelectLabel: "yes"',
      ]);
    });

    it('drops datasets unless it is exactly one known ID', () => {
      [[], ['zoo', 'heart'], ['nope'], 'zoo'].forEach(datasets => {
        expect(cleanMode({datasets}, KNOWN).mode).toEqual({});
      });
    });

    it('drops an out-of-range accuracy', () => {
      expect(cleanMode({requireAccuracy: 101}, KNOWN).mode).toEqual({});
    });
  });

  it('getSelectedDataset returns the one dataset', () => {
    expect(getSelectedDataset({datasets: ['zoo']})).toBe('zoo');
    expect(getSelectedDataset({})).toBeUndefined();
  });

  describe('withDefaultTrainer', () => {
    it('adds k-nearest neighbors when no trainer is set', () => {
      expect(withDefaultTrainer({hideSave: true})).toEqual({
        hideSave: true,
        trainer: 'knn',
      });
    });

    it('keeps an existing trainer', () => {
      expect(withDefaultTrainer({trainer: 'decisionTree'}).trainer).toBe(
        'decisionTree'
      );
    });
  });
});

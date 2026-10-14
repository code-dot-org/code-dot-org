import {
  cleanMode,
  getSelectedDataset,
  setBooleanMode,
  withDefaultTrainer,
  withRandomTestData,
} from '@cdo/apps/lab2/levelEditors/ailabMode/ailabMode';

const KNOWN = ['zoo', 'heart'];

describe('ailabMode', () => {
  describe('cleanMode', () => {
    it('keeps valid values in their original order', () => {
      const mode = {
        trainer: 'decisionTree',
        datasets: ['zoo'],
        requireAccuracy: 80,
        hideSave: false,
        lockFeatures: true,
        pretrained: true,
        hideDatasetView: true,
        hideTestingView: true,
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

    it('checks only the shape of the label and features', () => {
      const mode = {label: 'any column', features: ['a', 'b']};
      expect(cleanMode(mode, KNOWN).mode).toEqual(mode);
      [
        {label: 3},
        {label: ''},
        {features: 'a'},
        {features: ['a', 2]},
        {features: []},
        {features: ['']},
        {features: ['a', 'a']},
      ].forEach(bad => {
        expect(cleanMode(bad, KNOWN).mode).toEqual({});
      });
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

  describe('withRandomTestData', () => {
    it('reserves random test rows when unset', () => {
      expect(withRandomTestData({})).toEqual({randomizeTestData: true});
    });

    it('keeps a saved choice of the last rows', () => {
      expect(withRandomTestData({randomizeTestData: false})).toEqual({
        randomizeTestData: false,
      });
    });
  });

  describe('setBooleanMode', () => {
    it('removes an unchecked key', () => {
      expect(setBooleanMode({hideSave: true}, 'hideSave', false)).toEqual({});
    });

    it('keeps random test rows unchecked', () => {
      expect(
        setBooleanMode({randomizeTestData: true}, 'randomizeTestData', false)
      ).toEqual({randomizeTestData: false});
    });
  });
});

import {
  cleanMode,
  getSelectedDataset,
  setTrainer,
  withDefaultTrainer,
} from '@cdo/apps/lab2/levelEditors/ailabMode/ailabMode';

const KNOWN = ['zoo', 'heart'];

describe('ailabMode', () => {
  describe('cleanMode', () => {
    it('keeps valid values in their original order', () => {
      const mode = {
        trainer: 'decisionTree',
        hyperparameters: {maxDepth: 3},
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

    it('checks only the shape of the label, features, and id column', () => {
      const mode = {label: 'any column', features: ['a', 'b'], idColumn: 'c'};
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

    it("keeps only a whole-number hyperparameter of the mode's trainer", () => {
      expect(cleanMode({hyperparameters: {k: 3}}, KNOWN).mode).toEqual({
        hyperparameters: {k: 3},
      });
      [
        {hyperparameters: {maxDepth: 3}},
        {trainer: 'decisionTree', hyperparameters: {k: 3}},
        {hyperparameters: {k: 0}},
        {hyperparameters: {k: 2.5}},
        {hyperparameters: {k: '3'}},
        {hyperparameters: {k: 3, maxDepth: 3}},
        {hyperparameters: [3]},
        {hyperparameters: 3},
        {hyperparameters: null},
      ].forEach(bad => {
        expect(cleanMode(bad, KNOWN).mode.hyperparameters).toBeUndefined();
      });
    });
  });

  it("setTrainer drops the previous trainer's hyperparameter", () => {
    expect(
      setTrainer({trainer: 'knn', hyperparameters: {k: 3}}, 'decisionTree')
    ).toEqual({trainer: 'decisionTree'});
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

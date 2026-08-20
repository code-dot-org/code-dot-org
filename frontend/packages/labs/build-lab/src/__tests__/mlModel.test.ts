import KNN from 'ml-knn';
import {describe, expect, it, vi} from 'vitest';

import {createMlModelElements, predictMlModel} from '../mlModel';
import type {ImportedMlModel} from '../project';

const model: ImportedMlModel = {
  id: 'model-1',
  metadata: {
    features: [
      {id: 'Color', values: ['red', 'blue']},
      {id: 'Size', min: 1, max: 10},
    ],
    label: {id: 'Class', values: ['A', 'B']},
  },
  name: 'Color classifier',
};

describe('Build Lab ML model controls', () => {
  it('creates editable controls and a prediction event target', () => {
    const generated = createMlModelElements(model, 'screen1', []);

    expect(generated.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ml-model1-color-input',
          kind: 'dropdown',
          mlFeatureId: 'Color',
          options: ['red', 'blue'],
        }),
        expect.objectContaining({
          id: 'ml-model1-size-input',
          kind: 'textInput',
          mlFeatureId: 'Size',
        }),
        expect.objectContaining({
          id: generated.predictionButtonId,
          kind: 'button',
          label: 'Predict',
        }),
        expect.objectContaining({
          id: generated.resultElementId,
          kind: 'label',
        }),
      ]),
    );
    expect(
      generated.elements.every(element => element.screenId === 'screen1'),
    ).toBe(true);
  });

  it('predicts from a string-shaped model response and decimal input', async () => {
    const trainedModel = new KNN([[0], [10]], [0, 1], {k: 1}).toJSON();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () =>
          JSON.stringify({
            featureNumberKey: {Class: {A: 0, B: 1}},
            features: [{id: 'Score', min: 0, max: 10}],
            label: {id: 'Class', values: ['A', 'B']},
            selectedTrainer: 'knnClassify',
            trainedModel,
          }),
        ok: true,
      }),
    );

    await expect(
      predictMlModel('model-1', [
        {
          id: 'score-input',
          inputValue: '9.5',
          kind: 'textInput',
          label: 'Score',
          mlFeatureId: 'Score',
          mlModelId: 'model-1',
          screenId: 'screen1',
          x: 0,
          y: 0,
        },
      ]),
    ).resolves.toBe('B');
    vi.unstubAllGlobals();
  });

  it('uses a dropdown option when a saved control has no input value', async () => {
    const trainedModel = new KNN([[0], [10]], [0, 1], {k: 1}).toJSON();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () =>
          JSON.stringify({
            featureNumberKey: {
              airborne: {no: 0.5, yes: 9.5},
              Class: {A: 0, B: 1},
            },
            features: [{id: 'airborne', values: ['no', 'yes']}],
            label: {id: 'Class', values: ['A', 'B']},
            selectedTrainer: 'knnClassify',
            trainedModel,
          }),
        ok: true,
      }),
    );

    const dropdown = {
      id: 'airborne-input',
      inputValue: undefined,
      kind: 'dropdown' as const,
      label: 'airborne',
      mlFeatureId: 'Airborne',
      mlModelId: 'model-1',
      options: ['no', 'yes'],
      screenId: 'screen1',
      x: 0,
      y: 0,
    };

    await expect(
      predictMlModel('model-1', [
        {...dropdown, id: 'airborne-label', kind: 'label'},
        dropdown,
      ]),
    ).resolves.toBe('A');
    await expect(
      predictMlModel('model-1', [{...dropdown, inputValue: 'yes'}]),
    ).resolves.toBe('B');
    vi.unstubAllGlobals();
  });
});

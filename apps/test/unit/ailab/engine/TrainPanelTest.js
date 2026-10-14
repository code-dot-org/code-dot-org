import {act, screen} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import TrainPanel from '@cdo/apps/ailab/engine/UIComponents/TrainPanel';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

function renderPanel({trained = false, mode = {}} = {}) {
  const store = levelStore(mode);
  const project = levelProject();
  const trainingRun = trained ? runTraining(store, project) : undefined;
  return renderWithProviders(createElement(TrainPanel), {
    store,
    project,
    trainingRun,
  });
}

const trainButton = () => screen.queryByRole('button', {name: 'Train model'});
const labelOptions = () =>
  Array.from(screen.getByRole('combobox', {name: 'Predict'}).options).map(
    option => option.value
  );
const featuresButton = () => screen.getByRole('button', {name: /^Using/});

describe('TrainPanel', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('shows Train model before training', () => {
    renderPanel();
    expect(trainButton()).not.toBeNull();
  });

  test('hides Train model while the training results show', () => {
    renderPanel({trained: true});
    expect(screen.getByText('Accuracy')).not.toBeNull();
    expect(trainButton()).toBeNull();
  });

  test('brings Train model back once the columns change', () => {
    const {projectActions} = renderPanel({trained: true});
    act(() => projectActions().removeSelectedFeature('legs'));
    expect(trainButton()).not.toBeNull();
  });

  test('lets students change the features', () => {
    renderPanel();
    expect(featuresButton().disabled).toBe(false);
    expect(labelOptions()).toEqual(['', 'animal', 'legs']);
  });

  test('locks the features, leaving them out of the label choices', () => {
    renderPanel({mode: {lockFeatures: true}});
    expect(featuresButton().disabled).toBe(true);
    expect(labelOptions()).toEqual(['', 'animal']);
  });

  test('never offers Train model on a pretrained level', () => {
    renderPanel({
      mode: {pretrained: true, hideSelectLabel: true, lockFeatures: true},
    });
    expect(trainButton()).toBeNull();
  });
});

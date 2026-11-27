import {act} from '@testing-library/react';
import {createElement} from 'react';

import {layoutDisplayTree} from '@cdo/apps/ailab/engine/helpers/displayTreeLayout';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {setTestData} from '@cdo/apps/ailab/engine/redux';
import {
  getDisplayTree,
  getPredictionTrace,
} from '@cdo/apps/ailab/engine/selectors/visualizationSelectors';
import train from '@cdo/apps/ailab/engine/train';
import {leafColorStyle} from '@cdo/apps/ailab/engine/UIComponents/leafColors';
import PredictionResult from '@cdo/apps/ailab/engine/UIComponents/PredictionResult';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

import moduleStyles from '@cdo/apps/ailab/engine/UIComponents/predictionResult.module.scss';

function renderBirdPrediction() {
  const store = levelStore({trainer: 'decisionTree'});
  const project = levelProject();
  const trainingRun = runTraining(store, project);
  const {trainedModel} = trainingRun;
  renderWithProviders(createElement(PredictionResult), {
    store,
    project,
    trainingRun,
  });
  act(() => {
    store.dispatch(setTestData('legs', '2'));
    train.onClickPredict(trainedModel, project);
  });
  return {store, project, trainedModel};
}

describe('PredictionResult', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  it('dots the answer step in the color of the leaf the tree reached', () => {
    const {store, project, trainedModel} = renderBirdPrediction();
    const state = store.getState();
    const reachedId = getPredictionTrace(state, project, trainedModel).path.at(
      -1
    );
    const reached = layoutDisplayTree(
      getDisplayTree(state, project, trainedModel)
    ).nodes.find(placed => placed.id === reachedId);
    const steps = [...document.getElementsByTagName('li')];
    const dots = [...document.getElementsByClassName(moduleStyles.answerDot)];

    expect(dots).toHaveLength(1);
    expect(steps.at(-1).contains(dots[0])).toBe(true);
    expect(dots[0].style.getPropertyValue('--leaf-color')).toBe(
      leafColorStyle(reached.answerIndex)['--leaf-color']
    );
  });
});

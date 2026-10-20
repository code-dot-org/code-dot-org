import {act, render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import * as ailab from '@cdo/apps/ailab/engine';
import {ACCURACY_AT_LEAST} from '@cdo/apps/ailab/lab2/AccuracyValidator';
import {AilabLevelProperties} from '@cdo/apps/ailab/lab2/types';
import AilabView from '@cdo/apps/ailab/lab2/views/AilabView';
import progress, {
  initProgress,
  sendSuccessReport,
  setCurrentLevelId,
} from '@cdo/apps/code-studio/progressRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import ProgressContainer from '@cdo/apps/lab2/progress/ProgressContainer';
import {Validation} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import LevelPropertiesWrapper, {
  useLevelProperties,
} from '@cdo/apps/lab2/views/LevelPropertiesWrapper';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@cdo/apps/ailab/engine', () => ({
  __esModule: true,
  AilabEngine: jest.fn(() => null),
  instructionsDismissed: jest.fn(),
}));

jest.mock('@cdo/apps/code-studio/progressRedux', () => ({
  __esModule: true,
  ...jest.requireActual('@cdo/apps/code-studio/progressRedux'),
  sendSuccessReport: jest.fn(() => ({type: 'test/sendSuccessReport'})),
}));

jest.mock('@cdo/apps/lab2/views/components/Instructions/ResourcePanel', () =>
  jest.fn(() => null)
);

const mockedAilab = jest.mocked(ailab);

const train = (accuracy: number) =>
  act(() => mockedAilab.AilabEngine.mock.lastCall?.[0].onTrained?.(accuracy));

const UNMET_MESSAGE = 'Train a model with at least 70% accuracy to continue.';

const ACCURACY_VALIDATIONS: Validation[] = [
  {
    key: 'accuracy_met',
    conditions: [{name: ACCURACY_AT_LEAST, value: 70}],
    message: '',
    next: true,
  },
  {key: 'accuracy_unmet', conditions: [], message: UNMET_MESSAGE, next: false},
];

const level = (id: number, mode?: ailab.Mode): AilabLevelProperties => ({
  id,
  name: `level ${id}`,
  appName: 'ailab',
  mode: mode && JSON.stringify(mode),
  validations: mode?.requireAccuracy ? ACCURACY_VALIDATIONS : undefined,
});

const LEVELS = {
  '1': level(1, {requireAccuracy: 70}),
  '2': level(2, {requireAccuracy: 70}),
  '3': level(3),
};

const CurrentLevel = () => {
  const {levelProperties} = useLevelProperties();
  return (
    <AilabView levelProperties={levelProperties as AilabLevelProperties} />
  );
};

describe('AilabView', () => {
  let store: Store;

  beforeEach(() => {
    jest.clearAllMocks();
    stubRedux();
    registerReducers({progress, lab});
    store = getStore();
    store.dispatch(
      initProgress({lessons: []} as unknown as Parameters<
        typeof initProgress
      >[0])
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderLevel(levelId: string) {
    store.dispatch(setCurrentLevelId(levelId));
    render(
      <Provider store={store}>
        <LevelPropertiesWrapper levelPropertiesMap={LEVELS}>
          <ProgressContainer appType="ailab">
            <CurrentLevel />
          </ProgressContainer>
        </LevelPropertiesWrapper>
      </Provider>
    );
  }

  const switchToLevel = (levelId: string) =>
    act(() => {
      store.dispatch(setCurrentLevelId(levelId));
    });

  const validationState = () => store.getState().lab.validationState;

  it('shows no message until a training run misses the minimum', () => {
    renderLevel('1');
    expect(validationState()).toMatchObject({
      hasConditions: true,
      satisfied: false,
      message: null,
    });

    train(65);
    expect(validationState()).toMatchObject({
      satisfied: false,
      message: UNMET_MESSAGE,
    });
  });

  it('gives fresh feedback after each miss', () => {
    renderLevel('1');
    train(60);
    const firstIndex = validationState().index;
    train(65);
    expect(validationState().index).toBeGreaterThan(firstIndex);
  });

  it('reports success once the model reaches the minimum', () => {
    renderLevel('1');
    train(70);
    expect(validationState().satisfied).toBe(true);
    expect(sendSuccessReport).toHaveBeenCalledWith('ailab');
  });

  it('gates the next level again when its requirement matches', () => {
    renderLevel('1');
    train(85);

    switchToLevel('2');
    expect(validationState()).toMatchObject({
      hasConditions: true,
      satisfied: false,
      message: null,
    });
  });

  it('clears the gate when the next level requires no accuracy', () => {
    renderLevel('1');
    train(60);

    switchToLevel('3');
    expect(validationState()).toMatchObject({
      hasConditions: false,
      message: null,
    });
  });

  it('describes the requirement on the disabled Continue', () => {
    renderLevel('1');
    expect(jest.mocked(ResourcePanel).mock.lastCall?.[0]).toMatchObject({
      validationTooltip: 'Train a model with at least 70% accuracy',
    });
  });
});

import ailab, {type AccuracyRequirement, type Mode} from '@code-dot-org/ailab';
import {act, render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {AilabLevelProperties} from '@cdo/apps/ailab/lab2/types';
import AilabView from '@cdo/apps/ailab/lab2/views/AilabView';
import progress, {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import ProgressContainer from '@cdo/apps/lab2/progress/ProgressContainer';
import LevelPropertiesWrapper, {
  useLevelProperties,
} from '@cdo/apps/lab2/views/LevelPropertiesWrapper';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@code-dot-org/ailab', () => ({
  __esModule: true,
  default: {
    mount: jest.fn(),
    unmount: jest.fn(),
    loadLevel: jest.fn(),
    instructionsDismissed: jest.fn(),
  },
}));

jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel',
  () => () => null
);

const mockedAilab = jest.mocked(ailab);

const reportRequirement = (requirement: AccuracyRequirement | null) =>
  mockedAilab.mount.mock.lastCall?.[0].setAccuracyRequirement?.(requirement);

const level = (id: number, mode?: Mode): AilabLevelProperties => ({
  id,
  name: `level ${id}`,
  appName: 'ailab',
  mode: mode && JSON.stringify(mode),
});

const LEVELS = {
  '1': level(1, {requireAccuracy: 70}),
  '2': level(2, {requireAccuracy: 70}),
  '3': level(3),
};

const UNMET = {
  hasConditions: true,
  satisfied: false,
  message: 'Train a model with at least 70% accuracy to continue.',
  index: 0,
};

// Hands AilabView its level in the same commit as ProgressContainer, so the
// validation reset there runs after AilabView's effects.
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
    // Reports synchronously from loadLevel, earlier than the real package does.
    mockedAilab.loadLevel.mockImplementation((mode?: Mode) => {
      const minimum = mode?.requireAccuracy;
      reportRequirement(minimum ? {minimum, met: false} : null);
    });

    stubRedux();
    registerReducers({progress, lab});
    store = getStore();
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

  const validationState = () => store.getState().lab.validationState;

  it('disables Continue until the model meets requireAccuracy', () => {
    renderLevel('1');
    expect(validationState()).toEqual(UNMET);

    act(() => reportRequirement({minimum: 70, met: true}));
    expect(validationState()).toEqual({
      hasConditions: true,
      satisfied: true,
      message: null,
      index: 0,
    });
  });

  it('has no conditions when the level requires no accuracy', () => {
    renderLevel('3');
    expect(validationState().hasConditions).toBe(false);
  });

  it('gates the next level again when its requirement matches', () => {
    renderLevel('1');
    act(() => reportRequirement({minimum: 70, met: true}));

    act(() => {
      store.dispatch(setCurrentLevelId('2'));
    });
    expect(validationState()).toEqual(UNMET);
  });
});

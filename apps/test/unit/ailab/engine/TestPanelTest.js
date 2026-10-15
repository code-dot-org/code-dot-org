import {act, fireEvent, screen, within} from '@testing-library/react';
import {createElement} from 'react';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {setPrediction} from '@cdo/apps/ailab/engine/redux';
import TestPanel from '@cdo/apps/ailab/engine/UIComponents/TestPanel';
import {STEP_INTERVAL_MS} from '@cdo/apps/ailab/engine/UIComponents/TraceStepper';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

const PENGUINS = [
  {species: 'Adelie', island: 'Torgersen', mass: '3750', bill: '39.1'},
  {species: 'Gentoo', island: 'Biscoe', mass: '5000', bill: '46.25'},
  {species: 'Chinstrap', island: 'Dream', mass: '3500', bill: '49.3'},
];

const PENGUIN_COLUMNS = {
  species: ColumnTypes.CATEGORICAL,
  island: ColumnTypes.CATEGORICAL,
  mass: ColumnTypes.NUMERICAL,
  bill: ColumnTypes.NUMERICAL,
};

function renderTestPanel(store, project, trainingRun) {
  renderWithProviders(createElement(TestPanel), {store, project, trainingRun});
}

// Renders a panel whose model is trained and reachable from the context.
function renderTrainedAnimalPanel(mode) {
  const store = levelStore(mode);
  const project = levelProject();
  renderTestPanel(store, project, runTraining(store, project));
  return store;
}

const penguinProject = () => levelProject(PENGUIN_COLUMNS, 'species');

function predictSnake() {
  fireEvent.change(screen.getByLabelText('legs'), {target: {value: '0'}});
  fireEvent.click(predictButton());
}

function predictBird() {
  fireEvent.change(screen.getByLabelText('legs'), {target: {value: '2'}});
  fireEvent.click(predictButton());
}

function predictButton() {
  return screen.getByRole('button', {name: 'Predict'});
}

function status() {
  return screen.getByRole('status').textContent.replaceAll('\u200B', '');
}

function watchStatus() {
  const observer = new MutationObserver(() => {});
  observer.observe(screen.getByRole('status'), {
    childList: true,
    subtree: true,
    characterData: true,
  });
  return () => observer.takeRecords().length;
}

function stepAnnouncement(index) {
  const steps = within(screen.getByRole('list')).getAllByRole('listitem');
  const [, text] = steps[index].children;
  return `Step ${index + 1} of ${steps.length}: ${text.textContent}`;
}

function pathAnnouncement(prediction) {
  const stepCount = within(screen.getByRole('list')).getAllByRole(
    'listitem'
  ).length;
  return [
    `AI predicts ${prediction}`,
    ...Array.from({length: stepCount}, (_, index) => stepAnnouncement(index)),
  ].join('. ');
}

describe('TestPanel', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('shows a field for each feature, in the order they were chosen', () => {
    renderTestPanel(
      levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species'),
      penguinProject()
    );

    const fields = [...document.querySelectorAll('input, select')];

    expect(fields.map(field => field.name)).toEqual([
      'ailab-test-island',
      'ailab-test-mass',
      'ailab-test-bill',
    ]);
  });

  test('a dropdown offers each option after a disabled prompt, and sets its feature', () => {
    const store = levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species');
    renderTestPanel(store, penguinProject());
    const island = screen.getByLabelText('island');

    expect(
      [...island.options].map(option => [option.text, option.disabled])
    ).toEqual([
      ['Choose one', true],
      ['Biscoe', false],
      ['Dream', false],
      ['Torgersen', false],
    ]);

    fireEvent.change(island, {target: {value: 'Dream'}});

    expect(store.getState().testData.island).toBe('Dream');
    expect(island.value).toBe('Dream');
  });

  test('Random fills every feature, enables Predict, and clears the last prediction', () => {
    const store = levelStore(undefined, PENGUINS, PENGUIN_COLUMNS, 'species');
    store.dispatch(setPrediction('Adelie', []));
    renderTestPanel(store, penguinProject());
    expect(predictButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', {name: 'Random'}));

    expect(Object.keys(store.getState().testData).sort()).toEqual([
      'bill',
      'island',
      'mass',
    ]);
    expect(predictButton().disabled).toBe(false);
    expect(store.getState().prediction).toBeUndefined();
  });

  test('a decision tree lists each step to its prediction', () => {
    renderTrainedAnimalPanel({trainer: 'decisionTree'});

    predictSnake();

    expect(
      screen.getByRole('heading', {name: 'AI predicts snake'})
    ).toBeTruthy();
    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].textContent).toMatch(/^1legs is [<≥] \d/);
    expect(steps[steps.length - 1].textContent).toBe(
      `${steps.length}animal is snake`
    );
  });

  test('a decision tree marks the step the stepper is on', () => {
    renderTrainedAnimalPanel({trainer: 'decisionTree'});
    predictSnake();
    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    const current = () =>
      steps.filter(step => step.getAttribute('aria-current') === 'step');

    expect(current()).toEqual([steps[0]]);

    fireEvent.click(screen.getByRole('button', {name: 'Next step'}));

    expect(current()).toEqual([steps[1]]);
  });

  test('a decision tree announces its whole path, then each step taken by hand, but never its controls', () => {
    renderTrainedAnimalPanel({trainer: 'decisionTree'});
    const nextStep = () => screen.getByRole('button', {name: 'Next step'});
    const textNodes = () => [...screen.getByRole('status').childNodes];

    expect(status()).toBe('');

    predictSnake();

    expect(status()).toBe(pathAnnouncement('snake'));
    expect(textNodes().map(node => node.nodeType)).toEqual([Node.TEXT_NODE]);
    expect(nextStep().closest('[aria-live], [role="status"]')).toBeNull();

    fireEvent.click(nextStep());

    expect(status()).toBe(stepAnnouncement(1));
    expect(textNodes().map(node => node.nodeType)).toEqual([Node.TEXT_NODE]);
  });

  describe('a decision tree, as its path plays', () => {
    const replay = () =>
      fireEvent.click(
        screen.getByRole('button', {name: 'Replay from the start'})
      );
    const skip = () =>
      fireEvent.click(screen.getByRole('button', {name: 'Skip to the answer'}));

    beforeEach(() => {
      jest.useFakeTimers();
      renderTrainedAnimalPanel({trainer: 'decisionTree'});
    });
    afterEach(() => {
      jest.useRealTimers();
      // jsdom has no matchMedia, so the reduced-motion case adds one.
      delete window.matchMedia;
    });

    test('says nothing more while it plays or skips', () => {
      predictBird();
      const changes = watchStatus();

      act(() => {
        jest.advanceTimersByTime(STEP_INTERVAL_MS);
      });
      skip();

      expect(changes()).toBe(0);
      expect(status()).toBe(pathAnnouncement('bird'));
    });

    test('reads the whole path again on Replay, and on the same prediction made again', () => {
      predictBird();
      skip();
      const changes = watchStatus();

      replay();

      expect(changes()).toBeGreaterThan(0);
      expect(status()).toBe(pathAnnouncement('bird'));

      fireEvent.click(predictButton());

      expect(changes()).toBeGreaterThan(0);
      expect(status()).toBe(pathAnnouncement('bird'));
    });

    test('reads the first step on each Replay under reduced motion', () => {
      window.matchMedia = query => ({matches: query.includes('reduce')});
      predictBird();
      const changes = watchStatus();

      replay();

      expect(changes()).toBeGreaterThan(0);
      expect(status()).toBe(stepAnnouncement(0));

      replay();

      expect(changes()).toBeGreaterThan(0);
      expect(status()).toBe(stepAnnouncement(0));
    });
  });

  test('a KNN model shows its prediction without steps', () => {
    renderTrainedAnimalPanel(undefined);

    predictSnake();

    expect(
      screen.getByRole('heading', {name: /^AI predicts (bird|dog|snake)$/})
    ).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
    expect(status()).toBe(
      screen.getByRole('heading', {name: /^AI predicts/}).textContent
    );
  });
});

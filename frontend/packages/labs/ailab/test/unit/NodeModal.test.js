import {act, fireEvent, screen, within} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '../../src/i18n';
import {setTestData} from '../../src/redux';
import train from '../../src/train';
import DecisionTree from '../../src/UIComponents/DecisionTree';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders, runTraining} from './renderWithProviders';

import moduleStyles from '../../src/UIComponents/decisionTree.module.scss';

function renderTrainedTree() {
  const store = levelStore({trainer: 'decisionTree'});
  const project = levelProject();
  const trainingRun = runTraining(store, project);
  renderWithProviders(createElement(DecisionTree), {
    store,
    project,
    trainingRun,
  });
  return {store, project, trainedModel: trainingRun.trainedModel};
}

function predictSnake({store, project, trainedModel}) {
  act(() => {
    store.dispatch(setTestData('legs', '0'));
    train.onClickPredict(trainedModel, project);
  });
}

// nwsapi throws computing the style of an element with a useId id once MUI's
// button styles are loaded, so role queries must not land on those elements.
function treeItems() {
  return Array.from(
    screen.getByRole('tree').querySelectorAll('[role="treeitem"]')
  );
}

function root() {
  return treeItems()[0];
}

function answer(prediction) {
  return treeItems().find(
    item =>
      item.querySelector(`.${moduleStyles.answer} .${moduleStyles.nodeText}`)
        ?.textContent === prediction
  );
}

function dialog() {
  return screen.getByRole('dialog');
}

function title() {
  return document.getElementById(dialog().getAttribute('aria-labelledby'))
    .textContent;
}

function cellTexts(row) {
  return Array.from(row.querySelectorAll('th, td'), cell => cell.textContent);
}

function shownRows() {
  const tables = within(dialog()).getAllByRole('table');
  const [, body] = within(tables[tables.length - 1]).getAllByRole('rowgroup');
  return within(body).getAllByRole('row').map(cellTexts);
}

function pathSteps() {
  const path = within(dialog()).getByRole('list', {name: 'Path to this node'});
  return within(path).getAllByRole('listitem');
}

function example() {
  return within(dialog()).queryByRole('region');
}

describe('NodeModal', () => {
  let trained;
  beforeEach(() => {
    I18n.initI18n();
    trained = renderTrainedTree();
  });
  afterEach(() => I18n.reset());

  it('opens on a click, titled by the question, with no path at the root', () => {
    fireEvent.click(root());

    expect(title()).toBe('legs?');
    expect(
      within(dialog()).queryByRole('list', {name: 'Path to this node'})
    ).toBeNull();
  });

  it('opens on Enter, and gives focus back to the node on Escape', () => {
    act(() => root().focus());
    fireEvent.keyDown(root(), {key: 'Enter'});

    expect(dialog()).toBeTruthy();

    fireEvent.keyDown(document, {key: 'Escape'});

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(root());
  });

  it('lists the rows tested on that reach the node, then the rows trained on', () => {
    fireEvent.click(root());

    expect(within(dialog()).getByText('1 Row')).toBeTruthy();
    expect(shownRows()).toEqual([['10', '4', 'dog']]);

    fireEvent.click(within(dialog()).getByRole('tab', {name: 'Training rows'}));

    expect(within(dialog()).getByText('9 Rows')).toBeTruthy();
    expect(shownRows().map(([number]) => number)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ]);
  });

  it("shows the model's columns, then every column on request", () => {
    fireEvent.click(root());
    expect(shownRows()).toEqual([['10', '4', 'dog']]);

    const panel = () =>
      dialog().querySelector("[role='tabpanel']:not([hidden])");
    fireEvent.click(within(panel()).getByLabelText('Show all columns'));
    expect(shownRows()).toEqual([['10', 'dog', '4']]);

    fireEvent.click(
      within(panel()).getByLabelText('Show only features and label')
    );
    expect(shownRows()).toEqual([['10', '4', 'dog']]);
  });

  it('walks the path from the root to an answer', () => {
    fireEvent.click(answer('snake'));

    const steps = pathSteps();
    expect(title()).toBe('AI predicts snake');
    expect(steps.map(step => step.textContent)).toEqual([
      '1legs is < 1',
      '2AI predicts snake',
    ]);
    expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(steps[0].hasAttribute('aria-current')).toBe(false);
  });

  it("splits an answer's accuracy check rows by whether the AI got them right", () => {
    fireEvent.click(answer('dog'));

    expect(shownRows()).toEqual([['10', '4', 'dog']]);

    fireEvent.click(
      within(dialog()).getByRole('button', {name: 'Incorrect (0)'})
    );

    expect(
      within(dialog()).getByText('No rows matched this filter')
    ).toBeTruthy();
    expect(
      within(dialog()).getByRole('button', {name: 'Correct (1)'})
    ).toBeTruthy();
  });

  it('shows your example only on the path of your prediction', () => {
    predictSnake(trained);

    fireEvent.click(answer('dog'));
    expect(example()).toBeNull();
    fireEvent.click(
      within(dialog()).getByRole('button', {name: 'Back to Testing'}),
    );

    fireEvent.click(answer('snake'));
    expect(within(example()).getByText('Your example')).toBeTruthy();
  });

  it('shows every answer and the prediction on each node of the path', () => {
    predictSnake(trained);
    const exampleRow = () => {
      const [, body] = within(example()).getAllByRole('rowgroup');
      return cellTexts(within(body).getByRole('row'));
    };

    fireEvent.click(root());
    expect(exampleRow()).toEqual(['0', 'snake']);
    fireEvent.click(
      within(dialog()).getByRole('button', {name: 'Back to Testing'}),
    );

    fireEvent.click(answer('snake'));
    expect(exampleRow()).toEqual(['0', 'snake']);
  });
});

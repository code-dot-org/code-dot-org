import {ThemeProvider} from '@mui/material/styles';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import I18n from '../../src/i18n';
import {
  playPredictionStep,
  setPredictionPlaying,
  setTestData,
} from '../../src/redux';
import train from '../../src/train';
import DecisionTree from '../../src/UIComponents/DecisionTree';
import {leafColorStyle} from '../../src/UIComponents/leafColors';

import {levelStore} from './levelStore';

import moduleStyles from '../../src/UIComponents/decisionTree.module.scss';

function predictSnake(store) {
  act(() => {
    store.dispatch(setTestData('legs', '0'));
    train.onClickPredict();
  });
}

function renderTrainedTree() {
  I18n.initI18n();
  const store = levelStore({trainer: 'decisionTree'});
  train.reset();
  train.init(store);
  train.onClickTrain();
  render(createElement(DecisionTree), {
    wrapper: ({children}) =>
      createElement(
        Provider,
        {store},
        createElement(
          ThemeProvider,
          {theme: getMuiThemeForBrand(undefined)},
          children,
        ),
      ),
  });
  return store;
}

function zoomToPathButton() {
  return screen.getByRole('button', {name: 'Zoom to your path'});
}

function tabStops() {
  return screen.getAllByRole('treeitem').filter(item => item.tabIndex === 0);
}

function canvasGroup() {
  return screen.getByRole('group', {name: "Your model's decision tree"});
}

function zoomInButton() {
  return screen.getByRole('button', {name: 'Zoom in'});
}

function focusRoot() {
  const [root] = screen.getAllByRole('treeitem');
  act(() => root.focus());
  return root;
}

function showStep(store, step) {
  act(() => {
    store.dispatch(playPredictionStep(step));
  });
}

function marked(className) {
  return [...document.getElementsByClassName(className)];
}

function slotPosition(node) {
  const {left, top} = node.parentElement.style;
  return [parseFloat(left), parseFloat(top)];
}

describe('DecisionTree', () => {
  let store;
  beforeEach(() => {
    store = renderTrainedTree();
  });
  afterEach(() => I18n.reset());

  it('marks every node as either a question or an answer', () => {
    const nodes = [...document.getElementsByClassName(moduleStyles.node)];
    const kinds = nodes.map(node =>
      node.classList.contains(moduleStyles.question)
        ? 'question'
        : node.classList.contains(moduleStyles.answer)
          ? 'answer'
          : 'neither',
    );

    expect(kinds).toContain('question');
    expect(kinds).toContain('answer');
    expect(kinds).not.toContain('neither');
  });

  it('dots each answer in its leaf color, left to right', () => {
    const nodes = [...document.getElementsByClassName(moduleStyles.node)];
    const answers = nodes.filter(node =>
      node.classList.contains(moduleStyles.answer),
    );
    const dotColor = node =>
      node
        .getElementsByClassName(moduleStyles.answerDot)[0]
        ?.style.getPropertyValue('--leaf-color');

    expect(answers.map(dotColor)).toEqual(
      answers.map((_, index) => leafColorStyle(index)['--leaf-color']),
    );
    expect(
      document.querySelectorAll(
        `.${moduleStyles.question} .${moduleStyles.answerDot}`,
      ),
    ).toHaveLength(0);
  });

  it('marks no path before a prediction', () => {
    expect(document.getElementsByClassName(moduleStyles.pathNode)).toHaveLength(
      0,
    );
    expect(document.getElementsByClassName(moduleStyles.pathEdge)).toHaveLength(
      0,
    );
    expect(
      document.getElementsByClassName(moduleStyles.pathBranch),
    ).toHaveLength(0);
  });

  it('offers zooming to the path only once there is a prediction', () => {
    expect(zoomToPathButton().disabled).toBe(true);

    predictSnake(store);

    expect(zoomToPathButton().disabled).toBe(false);
  });

  it('marks the path from the root to the answer the model predicts', () => {
    predictSnake(store);

    const marked = [...document.getElementsByClassName(moduleStyles.pathNode)];
    const [marks] = document.getElementsByClassName(moduleStyles.marks);
    const pathEdges = [
      ...document.getElementsByClassName(moduleStyles.pathEdge),
    ];
    const pathBranches = [
      ...document.getElementsByClassName(moduleStyles.pathBranch),
    ];

    expect(marked.length).toBeGreaterThan(1);
    expect(slotPosition(marked[0])[1]).toBe(0);
    expect(marked[marked.length - 1].textContent).toBe('snake');
    expect(pathEdges).toHaveLength(marked.length - 1);
    expect(marks.parentElement.lastElementChild).toBe(marks);
    expect(pathEdges.every(edge => edge.parentElement === marks)).toBe(true);
    expect(pathBranches).toHaveLength(marked.length - 1);
    expect(pathBranches.map(branch => branch.nextElementSibling)).toEqual(
      marked.slice(1),
    );
  });

  it('marks the path only up to the chosen step, and dashes the way on', () => {
    predictSnake(store);
    showStep(store, 0);

    const [marks] = marked(moduleStyles.marks);
    const nextEdges = marked(moduleStyles.nextEdge);

    expect(marked(moduleStyles.pathNode)).toHaveLength(1);
    expect(slotPosition(marked(moduleStyles.pathNode)[0])[1]).toBe(0);
    expect(marked(moduleStyles.pathEdge)).toHaveLength(0);
    expect(nextEdges).toHaveLength(1);
    expect(nextEdges[0].parentElement).toBe(marks);
    expect(marked(moduleStyles.nextBranch)).toHaveLength(1);

    showStep(store, 1);

    expect(marked(moduleStyles.pathNode)).toHaveLength(2);
    expect(marked(moduleStyles.pathEdge)).toHaveLength(1);
    expect(marked(moduleStyles.pathBranch)).toHaveLength(1);
  });

  it('is one tab stop, around the tree and its zoom buttons', () => {
    expect(canvasGroup().tabIndex).toBe(0);
    expect(tabStops()).toHaveLength(0);
    expect(zoomInButton().tabIndex).toBe(-1);
  });

  it('goes in on Enter, to the root of the named tree', () => {
    const tree = screen.getByRole('tree', {name: "Your model's decision tree"});
    const [root] = screen.getAllByRole('treeitem');

    act(() => canvasGroup().focus());
    fireEvent.keyDown(canvasGroup(), {key: 'Enter'});

    expect(document.activeElement).toBe(root);
    expect(tree.contains(root)).toBe(true);
    expect(tabStops()).toEqual([root]);
    expect(zoomInButton().tabIndex).toBe(0);
  });

  it('comes back out to the canvas on Escape', () => {
    const root = focusRoot();

    fireEvent.keyDown(root, {key: 'Escape'});

    expect(document.activeElement).toBe(canvasGroup());
    expect(tabStops()).toHaveLength(0);
  });

  it('goes back in at the node it left', () => {
    const items = screen.getAllByRole('treeitem');
    const last = items[items.length - 1];
    act(() => last.focus());

    fireEvent.keyDown(last, {key: 'Escape'});
    fireEvent.keyDown(canvasGroup(), {key: 'Enter'});

    expect(document.activeElement).toBe(last);
  });

  it('takes the tree out of the tab order once focus leaves the canvas', () => {
    const root = focusRoot();

    act(() => root.blur());

    expect(tabStops()).toHaveLength(0);
  });

  it('marks each question open on its answers, and no answer at all', () => {
    const items = screen.getAllByRole('treeitem');
    const questions = items.filter(item =>
      item.querySelector(`.${moduleStyles.question}`),
    );
    const answers = items.filter(item =>
      item.querySelector(`.${moduleStyles.answer}`),
    );

    expect(questions.length).toBeGreaterThan(0);
    expect(answers.length).toBeGreaterThan(0);
    questions.forEach(item =>
      expect(item.getAttribute('aria-expanded')).toBe('true'),
    );
    answers.forEach(item =>
      expect(item.hasAttribute('aria-expanded')).toBe(false),
    );
  });

  it('places each node in the tree by level and branch', () => {
    const [root, firstChild] = screen.getAllByRole('treeitem');

    expect(root.getAttribute('aria-setsize')).toBe('1');
    expect(firstChild.getAttribute('aria-level')).toBe('2');
    expect(firstChild.getAttribute('aria-posinset')).toBe('1');
    expect(firstChild.getAttribute('aria-setsize')).toBe('2');
  });

  it("names an answer by its parent's question, its branch and its prediction", () => {
    const [, firstChild] = screen.getAllByRole('treeitem');

    expect(
      screen.getByRole('treeitem', {
        name: 'legs is less than 1 , predicts snake',
      }),
    ).toBe(firstChild);
  });

  it("names a question by its parent's question, its branch and itself", () => {
    const [, , secondChild] = screen.getAllByRole('treeitem');

    expect(
      screen.getByRole('treeitem', {name: /^legs is at least 1 , then legs/}),
    ).toBe(secondChild);
  });

  it('describes the canvas by how to go in, and the tree and its root by how to move', () => {
    const keysHint = 'Use the arrow keys to move, and Escape to exit';
    const [root] = screen.getAllByRole('treeitem');

    expect(
      screen.getByRole('group', {
        description: 'Press Enter to explore the tree',
      }),
    ).toBe(canvasGroup());
    expect(screen.getByRole('tree', {description: keysHint})).toBe(
      screen.getByRole('tree'),
    );
    expect(screen.getByRole('treeitem', {description: keysHint})).toBe(root);
  });

  it("shows each branch's whole text on its pill", () => {
    const pills = [...document.getElementsByClassName(moduleStyles.branch)];

    expect(pills.map(pill => pill.textContent)).toContain('< 1');
    expect(pills.map(pill => pill.textContent)).toContain('≥ 1');
    pills.forEach(pill => expect(pill.textContent).toBe(pill.title));
  });

  it('describes each node on the path as on it', () => {
    predictSnake(store);

    const marked = [...document.getElementsByClassName(moduleStyles.pathNode)];
    const described = screen.getAllByRole('treeitem', {
      description: /On your path/,
    });

    expect(described).toEqual(marked.map(node => node.parentElement));
  });

  it('tells screen readers how far the path goes at the chosen step', () => {
    predictSnake(store);
    showStep(store, 0);

    const [root] = screen.getAllByRole('treeitem');
    const described = screen.getAllByRole('treeitem', {
      description: /On your path/,
    });
    const current = screen
      .getAllByRole('treeitem')
      .filter(item => item.getAttribute('aria-current') === 'step');

    expect(described).toEqual([root]);
    expect(current).toEqual([root]);
  });

  it('moves focus and the tab stop down to a child and back up', () => {
    const root = focusRoot();

    fireEvent.keyDown(root, {key: 'ArrowDown'});
    const child = document.activeElement;

    expect(child.getAttribute('aria-level')).toBe('2');
    expect(tabStops()).toEqual([child]);

    fireEvent.keyDown(child, {key: 'ArrowUp'});

    expect(document.activeElement).toBe(root);
    expect(tabStops()).toEqual([root]);
  });

  it('keeps an arrow at an edge from scrolling the page', () => {
    const root = focusRoot();

    expect(fireEvent.keyDown(root, {key: 'ArrowUp'})).toBe(false);
    expect(document.activeElement).toBe(root);
  });

  it('leaves arrows with a modifier to the browser', () => {
    const root = focusRoot();

    expect(fireEvent.keyDown(root, {key: 'ArrowDown', altKey: true})).toBe(
      true,
    );
    expect(document.activeElement).toBe(root);
  });

  describe('while a prediction plays', () => {
    const playing = () => store.getState().predictionPlaying;

    beforeEach(() => {
      predictSnake(store);
      act(() => {
        store.dispatch(setPredictionPlaying(true));
      });
    });

    it('stops it when the student goes into the tree', () => {
      act(() => canvasGroup().focus());

      expect(playing()).toBe(false);
    });

    it('stops it when the student presses on the tree', () => {
      fireEvent.pointerDown(screen.getByRole('tree'));

      expect(playing()).toBe(false);
    });

    it('stops it when the student zooms with the wheel', () => {
      fireEvent.wheel(screen.getByRole('tree'), {deltaY: -100});

      expect(playing()).toBe(false);
    });
  });
});

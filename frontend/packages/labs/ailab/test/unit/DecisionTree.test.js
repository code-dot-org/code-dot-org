import {ThemeProvider} from '@mui/material/styles';
import {act, createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import I18n from '../../src/i18n';
import {setTestData} from '../../src/redux';
import train from '../../src/train';
import DecisionTree from '../../src/UIComponents/DecisionTree';

import {levelStore} from './levelStore';

import moduleStyles from '../../src/UIComponents/decisionTree.module.scss';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

let root;

function render(store) {
  root = createRoot(document.body.appendChild(document.createElement('div')));
  act(() =>
    root.render(
      createElement(
        Provider,
        {store},
        createElement(
          ThemeProvider,
          {theme: getMuiThemeForBrand(undefined)},
          createElement(DecisionTree),
        ),
      ),
    ),
  );
}

function predictSnake(store) {
  act(() => {
    store.dispatch(setTestData('legs', '0'));
    train.onClickPredict(store);
  });
}

function renderTrainedTree() {
  I18n.initI18n();
  const store = levelStore({trainer: 'decisionTree'});
  train.reset();
  train.init(store);
  train.onClickTrain();
  render(store);
  return store;
}

function zoomToPathButton() {
  return document.querySelector('[aria-label="Zoom to your path"]');
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
  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = '';
    I18n.reset();
  });

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

  it('marks no path before a prediction', () => {
    expect(document.getElementsByClassName(moduleStyles.pathNode)).toHaveLength(
      0,
    );
    expect(document.getElementsByClassName(moduleStyles.pathEdge)).toHaveLength(
      0,
    );
  });

  it('offers zooming to the path only once there is a prediction', () => {
    expect(zoomToPathButton().disabled).toBe(true);

    predictSnake(store);

    expect(zoomToPathButton().disabled).toBe(false);
  });

  it('marks the path from the root to the answer the model predicts', () => {
    predictSnake(store);

    const marked = [...document.getElementsByClassName(moduleStyles.pathNode)];
    const edges = [...document.getElementsByTagName('path')];
    const pathEdges = [
      ...document.getElementsByClassName(moduleStyles.pathEdge),
    ];

    expect(marked.length).toBeGreaterThan(1);
    expect(slotPosition(marked[0])[1]).toBe(0);
    expect(marked[marked.length - 1].textContent).toBe('snake');
    expect(pathEdges).toHaveLength(marked.length - 1);
    expect(edges.slice(-pathEdges.length)).toEqual(pathEdges);
  });
});

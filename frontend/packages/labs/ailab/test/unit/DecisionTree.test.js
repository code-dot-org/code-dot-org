import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';

import I18n from '../../src/i18n';
import {setTestData} from '../../src/redux';
import train from '../../src/train';
import DecisionTree from '../../src/UIComponents/DecisionTree';

import {levelStore} from './levelStore';

import moduleStyles from '../../src/UIComponents/decisionTree.module.scss';

function render(store) {
  document.body.innerHTML = renderToStaticMarkup(
    createElement(Provider, {store}, createElement(DecisionTree)),
  );
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

  it('marks no path before a prediction', () => {
    expect(document.getElementsByClassName(moduleStyles.pathNode)).toHaveLength(
      0,
    );
    expect(document.getElementsByClassName(moduleStyles.pathEdge)).toHaveLength(
      0,
    );
  });

  it('marks the path from the root to the answer the model predicts', () => {
    store.dispatch(setTestData('legs', '0'));
    train.onClickPredict(store);
    render(store);

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

  it('names the path of a prediction in the diagram label', () => {
    store.dispatch(setTestData('legs', '0'));
    train.onClickPredict(store);
    render(store);

    expect(
      document.querySelector('[role="img"]').getAttribute('aria-label'),
    ).toMatch(
      /^Diagram of your model's decision tree\. The path of your prediction: legs is 0, which is less than [\d.]+\. Answer: snake\.$/,
    );
  });
});

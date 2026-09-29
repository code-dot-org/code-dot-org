import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';

import {layoutDisplayTree} from '../../src/helpers/displayTreeLayout';
import I18n from '../../src/i18n';
import {setTestData} from '../../src/redux';
import {
  getDisplayTree,
  getPredictionTrace,
} from '../../src/selectors/visualizationSelectors';
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

  it('marks only the nodes and edges on the path of a prediction', () => {
    store.dispatch(setTestData('legs', '0'));
    train.onClickPredict(store);
    render(store);

    const state = store.getState();
    const {path} = getPredictionTrace(state);
    const onPath = layoutDisplayTree(getDisplayTree(state)).nodes.filter(
      placed => path.includes(placed.id),
    );
    const marked = [...document.getElementsByClassName(moduleStyles.pathNode)];

    expect(marked.map(slotPosition)).toEqual(
      onPath.map(placed => [placed.x, placed.y]),
    );
    expect(document.getElementsByClassName(moduleStyles.pathEdge)).toHaveLength(
      path.length - 1,
    );
  });
});

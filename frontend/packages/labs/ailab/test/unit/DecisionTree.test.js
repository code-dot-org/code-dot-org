import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';

import I18n from '../../src/i18n';
import train from '../../src/train';
import DecisionTree from '../../src/UIComponents/DecisionTree';

import {levelStore} from './levelStore';

import moduleStyles from '../../src/UIComponents/decisionTree.module.scss';

function renderTrainedTree() {
  I18n.initI18n();
  const store = levelStore({trainer: 'decisionTree'});
  train.reset();
  train.init(store);
  train.onClickTrain();
  document.body.innerHTML = renderToStaticMarkup(
    createElement(Provider, {store}, createElement(DecisionTree)),
  );
}

describe('DecisionTree', () => {
  beforeEach(renderTrainedTree);
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
});

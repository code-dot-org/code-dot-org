import fs from 'fs';
import path from 'path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';

import I18n from '../../src/i18n';
import train from '../../src/train';
import DecisionTree from '../../src/UIComponents/DecisionTree';

import {levelStore} from './levelStore';

import moduleStyles from '../../src/UIComponents/decisionTree.module.scss';

const STYLESHEET = path.join(
  __dirname,
  '../../src/UIComponents/decisionTree.module.scss',
);

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

function treeVariables(names) {
  return [...new Set(names.filter(name => name.startsWith('--tree-')))].sort();
}

describe('DecisionTree', () => {
  beforeEach(renderTrainedTree);
  afterEach(() => I18n.reset());

  it('sets on the canvas exactly the --tree-* variables its stylesheet reads', () => {
    const read = [
      ...fs.readFileSync(STYLESHEET, 'utf8').matchAll(/var\((--[\w-]+)/g),
    ].map(match => match[1]);
    const canvasStyle = document
      .querySelector('[role="img"]')
      .getAttribute('style');
    const set = canvasStyle.split(';').map(rule => rule.split(':')[0].trim());

    expect(treeVariables(read)).not.toHaveLength(0);
    expect(treeVariables(set)).toEqual(treeVariables(read));
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
});

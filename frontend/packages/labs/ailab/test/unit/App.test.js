import fs from 'fs';
import path from 'path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';

import App from '../../src/App';
import I18n from '../../src/i18n';

import {levelStore} from './levelStore';

const SRC = path.join(__dirname, '../../src');

function ailabVariables(names) {
  return [...new Set(names.filter(name => name.startsWith('--ailab-')))].sort();
}

describe('App', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  it('sets on its root exactly the --ailab-* variables the stylesheets read', () => {
    const read = fs
      .readdirSync(SRC, {recursive: true})
      .filter(file => file.endsWith('.scss'))
      .flatMap(file => [
        ...fs
          .readFileSync(path.join(SRC, file), 'utf8')
          .matchAll(/var\((--[\w-]+)/g),
      ])
      .map(match => match[1]);
    document.body.innerHTML = renderToStaticMarkup(
      createElement(
        Provider,
        {store: levelStore({})},
        createElement(App, {onContinue() {}, saveTrainedModel() {}}),
      ),
    );
    const rootStyle = document.body.firstElementChild.getAttribute('style');
    const set = rootStyle.split(';').map(rule => rule.split(':')[0].trim());

    expect(ailabVariables(read)).not.toHaveLength(0);
    expect(ailabVariables(set)).toEqual(ailabVariables(read));
  });
});

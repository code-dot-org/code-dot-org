import fs from 'fs';
import path from 'path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';

import App from '../../src/App';
import I18n from '../../src/i18n';

import {cssVariablesRead, cssVariablesSet} from './cssVariables';
import {levelStore} from './levelStore';

const SRC = path.join(__dirname, '../../src');

describe('App', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  it('sets on its root exactly the --ailab-* variables the stylesheets read', () => {
    const stylesheets = fs
      .readdirSync(SRC, {recursive: true})
      .filter(file => file.endsWith('.scss'))
      .map(file => path.join(SRC, file));
    document.body.innerHTML = renderToStaticMarkup(
      createElement(
        Provider,
        {store: levelStore({})},
        createElement(App, {onContinue() {}, saveTrainedModel() {}}),
      ),
    );
    const read = cssVariablesRead(stylesheets, '--ailab-');

    expect(read).not.toHaveLength(0);
    expect(
      cssVariablesSet(document.body.firstElementChild, '--ailab-'),
    ).toEqual(read);
  });
});

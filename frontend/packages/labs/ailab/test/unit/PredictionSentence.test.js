import {render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import I18n from '../../src/i18n';
import rootReducer from '../../src/redux';
import PredictionSentence from '../../src/UIComponents/PredictionSentence';

function renderSentence(props) {
  return render(
    createElement(
      Provider,
      {store: createStore(rootReducer)},
      createElement(PredictionSentence, props),
    ),
  );
}

describe('PredictionSentence', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('shows the label and each feature as tags', () => {
    renderSentence({label: 'species', features: ['island', 'mass']});

    expect(screen.getByText('species')).toBeTruthy();
    expect(screen.getByText('island')).toBeTruthy();
    expect(screen.getByText('mass')).toBeTruthy();
  });

  test('gives screen readers the whole sentence as one string', () => {
    const {container} = renderSentence({
      label: 'species',
      features: ['island', 'mass'],
    });

    expect(
      screen.getByText('Predict species based on island, mass'),
    ).toBeTruthy();
    const [readable, ...pieces] = container.firstChild.children;
    expect(readable.getAttribute('aria-hidden')).toBeNull();
    expect(pieces.length).toBeGreaterThan(0);
    pieces.forEach(piece =>
      expect(piece.getAttribute('aria-hidden')).toBe('true'),
    );
  });

  test('shows placeholders when nothing is chosen', () => {
    renderSentence({label: undefined, features: []});

    expect(screen.getByText('label')).toBeTruthy();
    expect(screen.getByText('feature')).toBeTruthy();
    expect(screen.getByText('Predict label based on feature')).toBeTruthy();
  });
});

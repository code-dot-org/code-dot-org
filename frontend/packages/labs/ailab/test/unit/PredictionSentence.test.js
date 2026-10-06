import {fireEvent, render, screen} from '@testing-library/react';
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

function layOutSentence(width) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function () {
      const right = this.textContent.length * 10;
      return {left: 0, top: 0, right, bottom: 0, width: right, height: 0};
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
}

// Everything after the readable sentence, up to the measuring ruler.
function shownPieces(container) {
  const [, ...pieces] = container.firstChild.children;
  return pieces.slice(0, -1).map(piece => piece.textContent);
}

describe('PredictionSentence', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  test('on a single line, collapses features that do not fit into a tag', async () => {
    // "based on" ends at 80px; tags end at 140, 180, 210; "+3" needs 20px.
    layOutSentence(200);
    const {container} = renderSentence({
      label: 'species',
      features: ['island', 'mass', 'sex'],
      singleLine: true,
    });

    expect(shownPieces(container)).toEqual([
      'Predict',
      'species',
      'based on',
      'island',
      'mass',
      '+1',
    ]);
    expect(
      screen.getByText('Predict species based on island, mass, sex'),
    ).toBeTruthy();

    const overflowTag = screen.getByText('+1');
    expect(overflowTag.tabIndex).toBe(0);
    fireEvent.mouseOver(overflowTag);
    expect((await screen.findByRole('tooltip')).textContent).toBe('sex');
  });

  test('on a single line, shows every feature when they fit', () => {
    layOutSentence(1000);
    const {container} = renderSentence({
      label: 'species',
      features: ['island', 'mass', 'sex'],
      singleLine: true,
    });

    expect(shownPieces(container)).toEqual([
      'Predict',
      'species',
      'based on',
      'island',
      'mass',
      'sex',
    ]);
  });
});

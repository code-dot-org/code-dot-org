import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import I18n from '../../src/i18n';
import rootReducer from '../../src/redux';
import PredictionSentence from '../../src/UIComponents/PredictionSentence';

let sentenceWidth;
const resizeCallbacks = new Set();

vi.stubGlobal(
  'ResizeObserver',
  class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      resizeCallbacks.add(this.callback);
    }
    disconnect() {
      resizeCallbacks.delete(this.callback);
    }
  },
);

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
  sentenceWidth = width;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function () {
      const right = this.textContent.length * 10;
      return {left: 0, top: 0, right, bottom: 0, width: right, height: 0};
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    () => sentenceWidth,
  );
}

function resizeSentence(width) {
  sentenceWidth = width;
  act(() => resizeCallbacks.forEach(callback => callback([])));
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

    const overflowTag = screen.getByRole('button', {name: '+1'});
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

  test('on a single line, refits as the sentence shrinks and grows', () => {
    layOutSentence(200);
    const {container} = renderSentence({
      label: 'species',
      features: ['island', 'mass', 'sex'],
      singleLine: true,
    });

    resizeSentence(160);
    expect(shownPieces(container).slice(3)).toEqual(['island', '+2']);

    resizeSentence(1000);
    expect(shownPieces(container).slice(3)).toEqual(['island', 'mass', 'sex']);
  });

  test('on a single line, sizes the overflow tag for the features it hides', () => {
    // Thirteen 10px tags after "based on" at 80px; "+3" needs 20px, "+13" 30px.
    layOutSentence(200);
    const features = 'abcdefghijklm'.split('');
    const {container} = renderSentence({
      label: 'species',
      features,
      singleLine: true,
    });

    expect(shownPieces(container).slice(3)).toEqual([
      ...features.slice(0, 10),
      '+3',
    ]);
  });
});

import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {compileEffect} from '../../compiler/compileEffect';
import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';

// LocalizeJS stands in as a plain dictionary: registered phrases translate,
// unregistered ones fall back to the source string, which is exactly the
// mainline singleton's behaviour before the engine has loaded.
const dictionary: Record<string, string> = {};
const setTranslations = (entries: Record<string, string>) =>
  Object.assign(dictionary, entries);

vi.mock('@code-dot-org/core/plugins/localization', () => ({
  localization: {
    translate: (key: string | string[]) =>
      Array.isArray(key)
        ? key.map(item => dictionary[item] ?? item)
        : (dictionary[key] ?? key),
  },
}));

afterEach(() => {
  for (const key of Object.keys(dictionary)) {
    delete dictionary[key];
  }
});

/**
 * A slice of translated rendering, proving strings pass through the seam at
 * render or throw time — and that the learner's own names never do.
 */
describe('localized rendering', () => {
  it('renders dictionary translations for chrome and node labels', () => {
    setTranslations({
      Multiply: 'Multiplicar',
      Undo: 'Deshacer',
      Parameter: 'Parámetro',
      Math: 'Matemáticas',
    });

    render(<EffectEditor initialDocument={createEffectDocument()} />);

    expect(
      screen.getByRole('button', {name: 'Multiplicar'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Deshacer'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Parámetro'})).toBeInTheDocument();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
  });

  it('translates compile errors at throw time', () => {
    setTranslations({
      'Nothing is connected to the Output yet.':
        'Aún no hay nada conectado a la Salida.',
    });

    const empty = {...createEffectDocument(), edges: []};
    expect(() => compileEffect(empty)).toThrow(
      'Aún no hay nada conectado a la Salida.',
    );
  });

  it('never translates user-entered parameter names', () => {
    // "Time" is a dictionary key (the stock knob); a learner naming their
    // parameter "Time" must still see their own text everywhere.
    setTranslations({Time: 'Tiempo', Parameter: 'Parámetro'});

    render(<EffectEditor initialDocument={createEffectDocument()} />);
    fireEvent.click(screen.getByRole('button', {name: 'Parámetro'}));
    fireEvent.change(screen.getByLabelText('Name'), {
      target: {value: 'Time'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    // The stock knob shows the translation; the parameter knob shows the
    // learner's raw name.
    expect(
      screen.getByRole('button', {name: 'Edit parameter Time'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Tiempo')).toBeInTheDocument();
  });

  it('marks the container for the LocalizeJS DOM engine to skip', () => {
    const {container} = render(
      <EffectEditor initialDocument={createEffectDocument()} />,
    );

    expect(
      container.querySelector('[data-notranslate="true"]'),
    ).toBeInTheDocument();
  });
});

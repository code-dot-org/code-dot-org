// The editor's localization adapter. What it owns — and therefore what is
// tested here — is the ORDER of the two operations: translate the template
// whole, then splice values in. Translation itself belongs to the mainline
// singleton, mocked here with a dictionary standing in for LocalizeJS.

import {beforeEach, describe, expect, it, vi} from 'vitest';

const dictionary: Record<string, string> = {};

vi.mock('@code-dot-org/core/plugins/localization', () => ({
  localization: {
    translate: (key: string | string[]) =>
      Array.isArray(key)
        ? key.map(item => dictionary[item] ?? item)
        : (dictionary[key] ?? key),
  },
}));

import {localization, translate} from '../index';

beforeEach(() => {
  for (const key of Object.keys(dictionary)) {
    delete dictionary[key];
  }
});

describe('localization', () => {
  it('is the mainline singleton, not a local stand-in', async () => {
    const mainline = await import('@code-dot-org/core/plugins/localization');
    expect(localization).toBe(mainline.localization);
  });

  it('falls back to the source string when nothing is registered', () => {
    expect(localization.translate('Search nodes')).toBe('Search nodes');
  });

  it('translates arrays element-wise, matching the mainline signature', () => {
    dictionary.Undo = 'Deshacer';
    expect(localization.translate(['Undo', 'Redo'])).toEqual([
      'Deshacer',
      'Redo',
    ]);
  });
});

describe('translate', () => {
  it('translates the whole template, then substitutes placeholders', () => {
    // The template is one stable string for translators — placeholders and all
    // — so the lookup must happen before any substitution.
    dictionary['"{name}" needs a texture wired into it.'] =
      '"{name}" necesita una textura conectada.';

    expect(
      translate('"{name}" needs a texture wired into it.', {name: 'Textura'}),
    ).toBe('"Textura" necesita una textura conectada.');
  });

  it('substitutes every occurrence of a placeholder', () => {
    expect(translate('{a} + {a} = {b}', {a: 1, b: 2})).toBe('1 + 1 = 2');
  });

  it('leaves user-entered values exactly as given', () => {
    // The learner's own name is spliced in untranslated, even when it collides
    // with a dictionary key — it never reaches the translator.
    dictionary['Edit parameter {name}'] = 'Editar parámetro {name}';
    dictionary.waviness = 'ondulación';

    expect(translate('Edit parameter {name}', {name: 'waviness'})).toBe(
      'Editar parámetro waviness',
    );
  });

  it('passes the source string through when there is nothing to substitute', () => {
    expect(translate('Search nodes')).toBe('Search nodes');
  });
});

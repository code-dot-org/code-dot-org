// The two attributes on the editor container that decide how it is rendered.
//
// Both look decorative and neither is. They are asserted here because the
// failure modes are silent-ish and only visible in a browser: one produces an
// unreadable editor, the other double-translated strings.

import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';

const container = () =>
  render(<EffectEditor initialDocument={createEffectDocument()} />).container
    .firstElementChild as HTMLElement;

describe('the editor container', () => {
  it('does not pin a theme of its own', () => {
    // The stylesheets read semantic colors (`--background-neutral-primary`,
    // `--text-neutral-primary`), which resolve against the nearest ancestor
    // carrying `data-theme` — the lab's own `div[data-theme]`. Setting one here
    // would override the learner's Light/Dark choice for this pane only, which
    // is what an earlier revision did.
    expect(container().hasAttribute('data-theme')).toBe(false);
  });

  it('marks itself for the LocalizeJS DOM engine to skip', () => {
    // Every string inside went through `translate` already; the DOM engine
    // would translate the output a second time and fight React's
    // reconciliation doing it.
    expect(container().getAttribute('data-notranslate')).toBe('true');
  });
});

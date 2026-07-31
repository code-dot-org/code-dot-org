// React Flow's chrome — the dot grid, the controls, the minimap — is painted
// from its own `colorMode` prop, not from the semantic CSS variables the rest
// of the editor reads. So it is the one part of the editor that has to be told
// the theme rather than inheriting it, and the one part that can silently
// disagree with everything around it: a light canvas keeping a black dot grid.
//
// The two halves cannot drift, though, and that is by construction: the
// design system's `ThemeProvider` renders `<div data-theme={theme}>` around its
// own context, so the attribute the stylesheets match on and the value
// `useTheme` reports are the same state. These tests drive that provider rather
// than setting the attribute by hand, so they exercise the real path.
//
// React Flow puts the mode on the flow container as a class name.

import {render} from '@testing-library/react';
import {useEffect} from 'react';
import {describe, expect, it} from 'vitest';

import {
  ThemeProvider,
  useTheme,
  type Theme,
} from '@code-dot-org/component-library/common/contexts';

import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';

/** `ThemeProvider` always starts Light; this is the only way to move it. */
const SetTheme = ({theme}: {theme: Theme}) => {
  const {setTheme} = useTheme();
  useEffect(() => setTheme(theme), [setTheme, theme]);
  return null;
};

const editor = <EffectEditor initialDocument={createEffectDocument()} />;

const flowClasses = (ui: React.ReactElement) =>
  render(ui).container.querySelector('.react-flow')?.className ?? '';

describe('React Flow color mode', () => {
  it('follows the lab into dark', () => {
    expect(
      flowClasses(
        <ThemeProvider>
          <SetTheme theme="Dark" />
          {editor}
        </ThemeProvider>,
      ),
    ).toContain('dark');
  });

  it('follows the lab in light', () => {
    expect(flowClasses(<ThemeProvider>{editor}</ThemeProvider>)).toContain(
      'light',
    );
  });

  it('falls back to light with no provider at all', () => {
    // `useTheme(true)` yields `{}` outside a ThemeProvider — the standalone
    // case — and Light is the design system's default (`:root` in colors.css),
    // which is what the stylesheet fallbacks assume too.
    expect(flowClasses(editor)).toContain('light');
  });
});

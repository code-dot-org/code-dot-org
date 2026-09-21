// The stock themes, and the one promise they both have to keep.
//
// A drawing names a role and the world says which file that role is looked up
// in. So a theme that is missing a role is a control drawn in whatever the pen
// happened to be carrying — visible and wrong rather than absent, which is the
// right failure and still a failure. Nothing else can catch it: the drawing is
// correct, the theme is valid JSON, and the two are in different files
// (specs/STYLES_PLAN.md).

import {describe, expect, it} from 'vitest';

import {resolveTheme} from '../../engine/core/theme';
import {STOCK_STYLES, STYLE_ROLES} from '../stock';

const themes = STOCK_STYLES.map(style => ({
  ...style,
  theme: resolveTheme(JSON.parse(style.contents)),
}));

describe('every stock theme', () => {
  it.each(themes)('parses and names itself: $id', ({name, theme}) => {
    expect(theme.name).toBe(name);
  });

  it.each(themes)('defines every role, and no others: $id', ({theme}) => {
    // BOTH DIRECTIONS. A missing role is a control painted in the last thing
    // the pen held; an extra one is a style nothing draws, which is a role
    // somebody meant to use and a `use style` somebody forgot to write.
    expect([...theme.styles.keys()].sort()).toEqual([...STYLE_ROLES].sort());
  });

  it.each(themes)('resolves every token it refers to: $id', ({theme}) => {
    // The failure this catches is a typo in a `$name`, which resolves to
    // nothing and paints nothing (`core/theme`).
    expect(theme.unresolved).toEqual([]);
  });
});

describe('the two of them together', () => {
  it('drive the same drawings, differing only in what a role MEANS', () => {
    // THE WHOLE CLAIM. Not one control changes between these two and not one
    // `use style` moves; what differs is the file. If the roles ever diverge,
    // the second theme has stopped being a theme and become a fork.
    const [modern, classic] = themes;
    expect([...modern.theme.styles.keys()].sort()).toEqual(
      [...classic.theme.styles.keys()].sort(),
    );
  });

  it('are actually different, which a copy would not be', () => {
    const [modern, classic] = themes;
    const face = (of: (typeof themes)[number]) =>
      of.theme.styles.get('button face')!;
    // Modern's button is borderless and raised; Classic's has an edge and
    // casts nothing. That pair is the case tokens alone could not express —
    // a drawing composing its own look would have needed a branch for it.
    expect(face(modern).shadow).not.toBeNull();
    expect(face(modern).stroke).toBeNull();
    expect(face(classic).shadow).toBeNull();
    expect(face(classic).stroke).not.toBeNull();
    expect(face(modern).corner).toBeGreaterThan(0);
    expect(face(classic).corner).toBe(0);
  });

  it('keep the focus ring high-contrast on both', () => {
    // A focus ring is an accessibility answer before it is a style, so the
    // two themes agree on it on purpose rather than by accident.
    for (const {theme} of themes) {
      const ring = theme.styles.get('focus ring')!;
      expect(ring.fill).toBeNull();
      expect(ring.stroke).toBe('#ffd45e');
    }
  });
});

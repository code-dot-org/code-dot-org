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

/** Find a stock theme's document by the path an `extends` would name. */
const documentAt = (path: string): unknown => {
  const found = STOCK_STYLES.find(style => `styles/${style.id}` === path);
  return found ? JSON.parse(found.contents) : undefined;
};

const themes = STOCK_STYLES.map(style => ({
  ...style,
  // RESOLVED WITH A WAY TO FIND A PARENT, which is how the world resolves
  // one: a variant holds only what differs and inherits the rest.
  theme: resolveTheme(JSON.parse(style.contents), documentAt),
}));

/** The themes a project starts from, as against a variant of one. */
const bases = themes.filter(
  one => !(JSON.parse(one.contents) as {extends?: string}).extends,
);

describe('every stock theme', () => {
  it.each(themes)('parses and names itself: $id', ({name, theme}) => {
    expect(theme.name).toBe(name);
  });

  it.each(themes)('defines every class, and no others: $id', ({theme}) => {
    // BOTH DIRECTIONS, and for a VARIANT too — which is the point of
    // resolving it against its parent: `danger.style` holds two classes and
    // has to end up holding all of them, or the parts of a danger button it
    // does not mention draw in whatever came before (specs/STYLES_PLAN.md).
    expect([...theme.styles.keys()].sort()).toEqual([...STYLE_ROLES].sort());
  });

  it.each(themes)('resolves every token it refers to: $id', ({theme}) => {
    // The failure this catches is a typo in a `$name`, which resolves to
    // nothing and paints nothing (`core/theme`).
    expect(theme.unresolved).toEqual([]);
  });
});

describe('a theme that extends one', () => {
  const danger = themes.find(one => one.id === 'danger')!;
  const modern = themes.find(one => one.id === 'modern')!;

  it('says only what differs, and is four lines', () => {
    const written = JSON.parse(danger.contents) as {
      styles: Record<string, unknown>;
    };
    expect(Object.keys(written.styles)).toEqual(['button', 'pressed']);
  });

  it('takes its parent’s classes whole', () => {
    expect(danger.theme.styles.get('caption')).toEqual(
      modern.theme.styles.get('caption'),
    );
    expect(danger.theme.styles.get('ring')).toEqual(
      modern.theme.styles.get('ring'),
    );
  });

  it('merges FIELD by field, so "the button but red" means that', () => {
    // Not instead of the parent's class: `{"button": {"fill": "$danger"}}`
    // has to keep the corner and the shadow, or a variant would have to
    // restate a whole class to change one colour.
    const button = danger.theme.styles.get('button')!;
    const parent = modern.theme.styles.get('button')!;
    expect(button.fill).not.toBe(parent.fill);
    expect(button.corner).toBe(parent.corner);
    expect(button.shadow).toEqual(parent.shadow);
  });

  it('reads a token its parent declared', () => {
    // `$danger` is Modern's. Tokens merge as classes do, so a variant can
    // refer to the palette it inherits without restating it.
    expect(danger.theme.styles.get('button')!.fill).toBe(
      modern.theme.tokens.danger,
    );
  });

  it('names its colours as a palette, not as the kit’s furniture', () => {
    // THE RENAME, pinned. The first cut lifted the names straight out of the
    // drawings — `surface edge`, `surface raised`, `well`, `muted ink` — which
    // is six words for two families with a quiet end and a loud one, plus one
    // nobody could read (specs/STYLES_PLAN.md).
    for (const {id, theme} of bases) {
      expect(Object.keys(theme.tokens).sort(), id).toEqual(
        [
          'accent',
          'accent light',
          'background',
          'border',
          'danger',
          'field',
          'focus',
          'ink',
          'ink light',
          'positive',
          'primary',
          'primary light',
          'primary strong',
          'radius',
          'radius bar',
          'radius tight',
          'ring radius',
          'ring width',
          'secondary',
          'warning',
        ].sort(),
      );
    }
  });

  it('means "strong" as contrast, which points opposite ways', () => {
    // WHY THE NAMES ARE NOT `light`/`dark`. On Modern the strong end is
    // lighter than the panel; on Classic it is darker. Both are the end with
    // contrast enough to be a border, which is the only thing a theme needs
    // it for — and a name meaning "lighter" would have been wrong in one of
    // the two files.
    const brightness = (hex: string) =>
      [1, 3, 5].reduce(
        (sum, at) => sum + parseInt(hex.slice(at, at + 2), 16),
        0,
      );
    const [modernBase, classicBase] = bases;
    const strongerThanPrimary = (of: (typeof bases)[number]) =>
      brightness(String(of.theme.tokens['primary strong'])) >
      brightness(String(of.theme.tokens.primary));

    expect(strongerThanPrimary(modernBase)).toBe(true);
    expect(strongerThanPrimary(classicBase)).toBe(false);
  });

  it('does not hang on a ring, and says which file made one', () => {
    const loop = (path: string) =>
      path === 'styles/a'
        ? {extends: 'styles/b', styles: {}}
        : {extends: 'styles/a', styles: {}};
    const resolved = resolveTheme({extends: 'styles/a', styles: {}}, loop, []);
    expect(resolved.unresolved.some(one => one.startsWith('extends'))).toBe(
      true,
    );
  });

  it('stands alone when nothing can find its parent', () => {
    // A theme whose parent was deleted is a theme, not a crash: it holds
    // what it holds, and the classes it lacks leave the pen alone.
    const alone = resolveTheme(JSON.parse(danger.contents));
    expect([...alone.styles.keys()].sort()).toEqual(['button', 'pressed']);
  });
});

describe('the two bases together', () => {
  it('drive the same drawings, differing only in what a class MEANS', () => {
    // THE WHOLE CLAIM. Not one control changes between these two and not one
    // `use style` moves; what differs is the file. If the roles ever diverge,
    // the second theme has stopped being a theme and become a fork.
    const [modern, classic] = bases;
    expect([...modern.theme.styles.keys()].sort()).toEqual(
      [...classic.theme.styles.keys()].sort(),
    );
  });

  it('are actually different, which a copy would not be', () => {
    const [modern, classic] = bases;
    const face = (of: (typeof themes)[number]) =>
      of.theme.styles.get('button')!;
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
      const ring = theme.styles.get('ring')!;
      expect(ring.fill).toBeNull();
      expect(ring.stroke).toBe('#ffd45e');
    }
  });
});

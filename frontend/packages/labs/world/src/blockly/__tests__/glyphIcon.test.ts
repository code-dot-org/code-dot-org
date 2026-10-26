// The icon font's family list, which is invisible when it is wrong.
//
// A missing family does not throw and does not warn: the glyph falls through
// to whatever font comes next, which has nothing at that codepoint, and the
// button draws an empty box. It is also the kind of thing that works on the
// machine it was written on — a licensed build has the pro faces — and fails
// everywhere else.

import {version as freeVersion} from '@fortawesome/fontawesome-free/package.json';
import {describe, expect, it, vi} from 'vitest';

import {glyphIcon} from '../extensions/glyphIcon';

describe('a FontAwesome glyph in a block', () => {
  it('names the FREE family as well as the pro one', () => {
    // The lab's own font list names the pro faces, because that is what a
    // licensed build loads. A build without the kit has the free package
    // instead — the design system's icons come from it — and the free faces
    // register under this name and no other.
    const icon = glyphIcon('');

    expect(icon.style.fontFamily).toContain('Font Awesome 6 Free');
    expect(icon.style.fontFamily).toContain('Font Awesome 6 Pro');
    expect(icon.style.fontFamily).toContain('Font Awesome 7 Free');
    expect(icon.style.fontFamily).toContain('Font Awesome 7 Pro');
  });

  it('names the major version the free package actually installs', () => {
    // THE ONE THAT BIT. A major version is part of the family NAME: 7
    // registers "Font Awesome 7 Free" and nothing at all under the 6 name. So
    // an upgrade of this dependency renames every face the list is asking
    // for, and nothing anywhere says so — the licensed build keeps working
    // off the pro faces while the free demo draws an empty box on every
    // button. Reading the installed package's own major is the only way to
    // notice, because the number is the whole of the bug.
    const major = freeVersion.split('.')[0];
    const icon = glyphIcon('\uf023');

    expect(icon.style.fontFamily).toContain(`Font Awesome ${major} Free`);
  });

  it('asks for solid, because that is the only weight the free package has', () => {
    // Without it the glyph matches no face in the free family, the family is
    // skipped, and the codepoint falls through exactly as if it had never been
    // named. The pro faces are forgiving about this and the free ones are not.
    expect(glyphIcon('').style.fontWeight).toBe('900');
  });

  it('is a tspan, because a block is SVG', () => {
    // Not the icon component's `<i>`, which would not render here.
    expect(glyphIcon('').tagName).toBe('tspan');
    expect(glyphIcon('').textContent).toBe('');
  });
});

describe('a Pro-only glyph in a build that has only Free', () => {
  // `freeIconShims` cannot reach this one: a codepoint in a `<tspan>` asks the
  // font directly, so there is no `--fa` property to rename and no class for
  // `reportMissingIcons` to walk. The substitution is the caller's, and this is
  // what says it happens — and only when the harness has declared the font.
  //
  // Fresh module each time, because the flag is set once for the life of a
  // build and there is no way back from it. A shared one would leak into every
  // other test here, in whichever order they happened to run.
  const load = async () => {
    vi.resetModules();
    return import('../extensions/glyphIcon');
  };

  it('draws the Pro glyph until somebody says otherwise', async () => {
    const {glyphIcon} = await load();

    expect(glyphIcon('\uf890', '\ue4dc').textContent).toBe('\uf890');
  });

  it('draws the free stand-in once the harness has said so', async () => {
    const {glyphIcon, useFreeIcons} = await load();
    useFreeIcons();

    expect(glyphIcon('\uf890', '\ue4dc').textContent).toBe('\ue4dc');
  });

  it('leaves a glyph both sets have alone', async () => {
    // The default is the glyph itself, so a caller with nothing to substitute
    // says nothing. Without it, declaring Free would blank every other button.
    const {glyphIcon, useFreeIcons} = await load();
    useFreeIcons();

    expect(glyphIcon('\uf06e').textContent).toBe('\uf06e');
  });
});

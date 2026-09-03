// The icon font's family list, which is invisible when it is wrong.
//
// A missing family does not throw and does not warn: the glyph falls through
// to whatever font comes next, which has nothing at that codepoint, and the
// button draws an empty box. It is also the kind of thing that works on the
// machine it was written on — a licensed build has the pro faces — and fails
// everywhere else.

import {version as freeVersion} from '@fortawesome/fontawesome-free/package.json';
import {describe, expect, it} from 'vitest';

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

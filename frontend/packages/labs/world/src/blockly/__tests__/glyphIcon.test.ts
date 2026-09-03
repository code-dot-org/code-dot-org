// The icon font's family list, which is invisible when it is wrong.
//
// A missing family does not throw and does not warn: the glyph falls through
// to whatever font comes next, which has nothing at that codepoint, and the
// button draws an empty box. It is also the kind of thing that works on the
// machine it was written on — a licensed build has the pro faces — and fails
// everywhere else.

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

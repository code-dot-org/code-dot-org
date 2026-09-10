// The buttons that ride on a block must not force a render while it is built.
//
// Each of these extensions adds or removes a field and then asks for the block
// to be drawn again. Doing that with `render()` is a SYNCHRONOUS layout pass,
// and the extension runs during construction — so it measures a block that is
// not finished, and, when the block is a shadow, a PARENT that is not finished
// either.
//
// What that looked like: `the ⟨any⟩ within ⟨80⟩ of ⟨place⟩` drew its first
// socket at zero by zero. The shadow was there in the SVG, correctly connected
// and carrying its 80 — it had simply been measured before it could be, and
// nothing measured it again. Its twin `the actors with ⟨Solid⟩ within …` was
// fine, and the only difference between them was the eye.
//
// `queueRender` defers to Blockly's own render management, which runs after
// construction. The one-line difference is invisible in every test that does
// not lay out SVG — which is every test here, jsdom having no layout — so this
// reads the sources instead. A guard over a rule, not over an implementation:
// the rule is "these extensions never force a synchronous render".

import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

/** Where the extensions live, from the package root vitest runs in. */
const DIR = 'src/blockly/extensions';

/** The extensions that put a button on a block. */
const BUTTONS = [
  'openSourceButton.ts',
  'enhanceButton.ts',
  'lessonButton.ts',
  'rulesButton.ts',
  'bodyButton.ts',
];

describe('a button extension', () => {
  it('is still the list this file thinks it is', () => {
    // A new button added beside these should be held to the same rule, and a
    // list nobody maintains would quietly stop covering it.
    const here = readdirSync(DIR)
      .filter(name => /Button\.ts$/.test(name))
      .sort();

    expect(here).toEqual([...BUTTONS].sort());
  });

  for (const file of BUTTONS) {
    it(`${file}: queues a render rather than forcing one`, () => {
      const source = readFileSync(join(DIR, file), 'utf8');

      expect(source).not.toMatch(/\.render\?\.\(\)/);
    });
  }
});

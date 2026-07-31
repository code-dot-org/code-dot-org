// US spelling for Blockly's stock color blocks.
//
// `colour_picker`, `colour_random` and `colour_blend` come from
// `@blockly/field-colour` and read their text from `Blockly.Msg`, which ships
// British spelling: "random colour", "Choose a colour from the palette." Every
// other word in this lab is US English — the effect editor calls a vec3 "color
// (RGB)", the stock effects name the parameter `color` — so leaving these would
// put both spellings in one toolbox category.
//
// Only the STRINGS are replaced. The block type ids (`colour_picker`) and the
// field name (`field_colour`) are Blockly's identifiers, not text a learner
// sees, and renaming them would break the serialization of every saved
// workspace for a spelling nobody reads.
//
// WHY THIS LOADS THE WHOLE LOCALE. The obvious version — assign the handful of
// overrides onto `Blockly.Msg` — takes the editor down, and instructively.
// `Agent.inject` loads English only `if (Object.keys(Blockly.Msg).length === 0)`,
// reading emptiness as "the embedder has not chosen a locale". One override
// makes it non-empty, so the locale never loads and every OTHER message is
// undefined; the first symptom is the workspace failing to build its ARIA label
// out of `WORKSPACE_LABEL_MANY_STACKS`. Setting the locale ourselves, with the
// overrides folded in, satisfies that check with a complete table.
//
// That check is a fragile way to ask the question and worth fixing upstream —
// any lab overriding a single message hits it. Until then, this file is
// deliberately the only place in the lab that writes to `Blockly.Msg`.

import * as En from 'blockly/msg/en';

import {Blockly} from '@code-dot-org/blockly';

/** `Blockly.Msg` key -> the US-spelled text to use instead. */
const COLOR_MESSAGES: Record<string, string> = {
  COLOUR_PICKER_TOOLTIP: 'Choose a color from the palette.',
  COLOUR_RANDOM_TITLE: 'random color',
  COLOUR_RANDOM_TOOLTIP: 'Choose a color at random.',
  COLOUR_BLEND_COLOUR1: 'color 1',
  COLOUR_BLEND_COLOUR2: 'color 2',
  COLOUR_BLEND_TOOLTIP:
    'Blends two colors together with a given ratio (0.0 - 1.0).',
  COLOUR_RGB_TITLE: 'color with',
  COLOUR_RGB_TOOLTIP:
    'Create a color with the specified amount of red, green, and blue. All values must be between 0 and 100.',
};

/**
 * Load English with the color messages replaced.
 *
 * A no-op once anything has populated `Msg`, so it neither repeats itself nor
 * stamps on an embedder that chose a different locale first.
 *
 * Must run BEFORE the blocks are defined: Blockly resolves a `%{BKY_…}`
 * placeholder when a block is defined, not when it is rendered.
 */
export function installColorMessages(): void {
  if (Object.keys(Blockly.Msg).length > 0) {
    return;
  }
  Blockly.setLocale({
    ...(En as unknown as Record<string, string>),
    ...COLOR_MESSAGES,
  });
}

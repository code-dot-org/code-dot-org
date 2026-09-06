// The words on a block, in the reader's language.
//
// Blockly has no notion of localization, so this is done to the DEFINITIONS
// before they are registered: every string a learner reads goes through the
// core localization plugin, and everything that is an identifier is left
// exactly as it was. The workspace itself is marked `notranslate` so that
// LocalizeJS's own DOM sweep does not go into the SVG and rewrite text nodes
// out from under Blockly's layout.
//
// WHY TRANSLATING `message0` IS ENOUGH, and it is the good news in all of
// this. A block's label is an interpolation — `push %1 out of %2 sideways,
// over %3` — and Blockly binds `%n` to `args0[n - 1]` wherever it appears. So
// a translation may put the arguments in a different ORDER, or add words
// between them, or take words away, and every argument keeps its identity:
// same input name, same type, same socket. A German label that ends with the
// verb is a different `message0` and the same block.
//
// WHAT MUST NOT BE TRANSLATED is the other half of the same fact, and getting
// it wrong is silent:
//
//   • `type` — the block's identity. Translate it and a saved file stops
//     loading, and a rule can no longer call another rule's block.
//   • an argument's `name` — how the generator finds its value.
//   • a dropdown's option VALUES. An option is `[what is read, what is
//     stored]`; the first is words and the second is data. Translating the
//     second writes French into the file.
//   • anything in a label that is not words. An actor's dropdown draws the
//     actor, so its label is an image and only the `alt` is readable.
//
// Nothing here is keyed: the English string IS the key, which is what
// LocalizeJS works from. So a block whose wording changes gets a new key and
// falls back to English until it is translated, which is the right failure.

import {localization} from '@code-dot-org/core/plugins/localization';

/** How a string becomes its translation. Injectable so a test can be exact. */
export type Translate = (text: string) => string;

const viaPlugin: Translate = text => localization.translate(text);

/** The message/args pairs a definition may carry (`message0` … `message4`). */
const ROWS = [0, 1, 2, 3, 4] as const;

/**
 * What a dropdown shows for one choice.
 *
 * Usually a string. But an actor's dropdown shows the actor — `{src, width,
 * height, alt}`, a picture with the name beside it for anyone who cannot see
 * it — and the only words in that are the `alt`. Handing the whole object to
 * `translate` is not a no-op: it walks an object it does not recognise field
 * by field, and `width: 24` comes back `{}`, which is not an image any more.
 * Blockly rejects the option, the field throws while it is being built, and
 * the editor comes up as "an error occurred while loading the lab".
 */
type Label = string | {src: string; alt?: string; [key: string]: unknown};

interface Option {
  0: Label;
  1: string;
}

/** One choice's label, with only the words in it translated. */
const localizeLabel = (label: Label, translate: Translate): Label => {
  if (typeof label === 'string') {
    return translate(label);
  }
  if (label && typeof label.alt === 'string') {
    return {...label, alt: translate(label.alt)};
  }
  return label;
};

interface Arg {
  type?: string;
  name?: string;
  options?: Option[] | (() => Option[]);
  [key: string]: unknown;
}

interface Definition {
  type?: string;
  tooltip?: string;
  [key: string]: unknown;
}

/** A dropdown's options, with what is READ translated and what is STORED kept. */
const localizeOptions = (
  options: Option[] | (() => Option[]) | undefined,
  translate: Translate,
): Option[] | (() => Option[]) | undefined => {
  if (typeof options === 'function') {
    // A live dropdown works its options out when it is opened, so the
    // translation has to happen then too — the enums it lists may not exist
    // yet at definition time.
    return () =>
      options().map(
        option =>
          [localizeLabel(option[0], translate), option[1]] as unknown as Option,
      );
  }
  return options?.map(
    option =>
      [localizeLabel(option[0], translate), option[1]] as unknown as Option,
  );
};

const localizeArgs = (args: unknown, translate: Translate): unknown => {
  if (!Array.isArray(args)) {
    return args;
  }
  return (args as Arg[]).map(arg =>
    arg?.options
      ? {...arg, options: localizeOptions(arg.options, translate)}
      : arg,
  );
};

/**
 * `blocks` with every word a learner reads translated.
 *
 * A new array of new objects: the definitions are registered by identity and a
 * mutated one would be a definition already in use, changed under Blockly.
 */
export function localizeBlocks<T>(
  blocks: readonly T[],
  translate: Translate = viaPlugin,
): T[] {
  return blocks.map(block => {
    const definition = {...(block as Definition)};
    for (const row of ROWS) {
      const message = definition[`message${row}`];
      if (typeof message === 'string') {
        definition[`message${row}`] = translate(message);
      }
      const args = definition[`args${row}`];
      if (args !== undefined) {
        definition[`args${row}`] = localizeArgs(args, translate);
      }
    }
    if (typeof definition.tooltip === 'string') {
      definition.tooltip = translate(definition.tooltip);
    }
    return definition as T;
  });
}

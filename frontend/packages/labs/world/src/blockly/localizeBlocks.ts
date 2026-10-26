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
//
// AND A TRANSLATION IS NOT TRUSTED WITH THE ARGUMENTS. Blockly checks a
// message against its `args0` when the block is defined, so a label that drops
// `%2`, repeats `%1`, or invents `%3` throws — and a definition that throws is
// the whole editor failing to load, in that language only. `safeMessage`
// refuses those and keeps the English.

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

/**
 * One choice's label, with only the words in it translated.
 *
 * Exported because a dropdown installed by an EXTENSION never passes through
 * `localizeBlocks` — the definition's options are replaced after the fact
 * (`liveDropdown`), so the translation has to happen where the list is made.
 */
export const localizeLabel = (label: Label, translate: Translate): Label => {
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
    //
    // CALLED THE WAY BLOCKLY CALLS IT, which the first version of this was
    // not. Blockly invokes an options generator as a METHOD of the field, and
    // this lab's generators read the field to know where they are — which
    // enum a choice belongs to, which subject's phases to offer, which rule to
    // leave out of a `use rule` list. An arrow function that called
    // `options()` gave them neither `this` nor the argument, so every one of
    // them answered as if it were nowhere: an empty list, a dropdown with no
    // text, and a block drawn as a bare arrow with nothing around it.
    const live = options as (this: unknown, ...args: unknown[]) => Option[];
    return function (this: unknown, ...args: unknown[]): Option[] {
      return (live as (...a: unknown[]) => Option[])
        .apply(this as never, args)
        .map(
          option =>
            [
              localizeLabel(option[0], translate),
              option[1],
            ] as unknown as Option,
        );
    } as unknown as () => Option[];
  }
  return options?.map(
    option =>
      [localizeLabel(option[0], translate), option[1]] as unknown as Option,
  );
};

/**
 * The argument indices a label interpolates, as a sorted list.
 *
 * `%%` is an escaped per-cent and refers to no argument, so it is stepped over
 * rather than read as `%` followed by a digit.
 */
const indicesIn = (message: string): number[] => {
  const found: number[] = [];
  for (const [, digits] of message.matchAll(/%(%|\d+)/g)) {
    if (digits !== '%') {
      found.push(Number(digits));
    }
  }
  return found.sort((a, b) => a - b);
};

/**
 * A translated label, or the English one when the translation cannot be drawn.
 *
 * A TRANSLATOR CAN TAKE THE LAB DOWN, and this is the only place to stop it.
 * Blockly checks a message against its arguments when the block is DEFINED and
 * throws three ways — `Message index %3 out of range`, `Message index %1
 * duplicated`, `Message does not reference all 2 arg(s)` — and a definition
 * that throws is not one bad block, it is the editor failing to load. So a
 * translation that drops an argument, repeats one, or invents one is refused
 * and the English stands.
 *
 * Deliberately NOT a repair: reordering is the whole point of translating a
 * label (`%2 seitlich aus %1`), so any rule clever enough to put a missing
 * `%2` back would have to know where it belongs in a language it cannot read.
 * English that a learner can use beats grammar nobody can.
 *
 * The comparison is the multiset of indices, so `%1 %2` and `%2 %1` are the
 * same and `%1 %1` is not.
 */
const safeMessage = (english: string, translated: string): string => {
  const want = indicesIn(english);
  const got = indicesIn(translated);
  return want.length === got.length && want.every((n, i) => n === got[i])
    ? translated
    : english;
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
        definition[`message${row}`] = safeMessage(message, translate(message));
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

/**
 * An interface string in the reader's language, with `%n` filled in.
 *
 * For the words that are NOT on a block: a warning, a button, anything the
 * editor composes itself. `translate` takes a string and gives a string, so a
 * message with a name in it has to be interpolated here — and it is done with
 * Blockly's own `%n`, so that a translation may put the name where the
 * language wants it rather than where English left it:
 *
 *   'Two of this rule’s members are both called “%1”.'
 *   'Zwei Mitglieder dieser Regel heißen beide “%1”.'
 *
 * `safeMessage` guards it for the same reason it guards a block's label: a
 * translation that dropped `%1` would print a sentence with the name missing,
 * and one that invented `%2` would print `%2`.
 */
export function localizeText(
  english: string,
  values: readonly string[] = [],
  translate: Translate = viaPlugin,
): string {
  const message = safeMessage(english, translate(english));
  return message.replace(/%(%|\d+)/g, (whole, digits) =>
    digits === '%' ? '%' : (values[Number(digits) - 1] ?? whole),
  );
}

/** A toolbox item, whatever shape the several toolbox formats give it. */
interface ToolboxItem {
  name?: unknown;
  kind?: unknown;
  text?: unknown;
  blocks?: unknown;
  contents?: unknown;
  [key: string]: unknown;
}

/** The item kinds whose `text` is words rather than a block type. */
const READABLE_KINDS = new Set(['button', 'label']);

const localizeItem = (item: unknown, translate: Translate): unknown => {
  if (typeof item !== 'object' || item === null) {
    // A bare block type. Identity, and it must stay identity.
    return item;
  }
  const entry = item as ToolboxItem;
  const out: ToolboxItem = {...entry};
  if (typeof entry.name === 'string') {
    out.name = translate(entry.name);
  }
  if (
    typeof entry.text === 'string' &&
    READABLE_KINDS.has(entry.kind as string)
  ) {
    out.text = translate(entry.text);
  }
  if (Array.isArray(entry.blocks)) {
    out.blocks = entry.blocks.map(child => localizeItem(child, translate));
  }
  if (Array.isArray(entry.contents)) {
    out.contents = entry.contents.map(child => localizeItem(child, translate));
  }
  return out;
};

/**
 * `toolbox` with the words on it translated: drawer names, and the buttons and
 * labels inside them.
 *
 * SEPARATE FROM `localizeBlocks` because a toolbox is not a block, and needed
 * because the workspace sits in a `data-notranslate` container — which is the
 * right call for the SVG Blockly lays out itself, but the toolbox is inside it
 * too, so a category name nothing translates stays English in every language.
 *
 * LAST, AFTER EVERY FILTER, and this is not a preference. Three things select
 * categories by NAME — the level's hidden categories (`withoutCategories`), the
 * progression's shelf (`toolboxShelf`), and the `Block` drawer an event surface
 * keeps (`surfaceToolbox`) — and each of them would stop matching the moment
 * the name it looks for is in another language. Translate on the way to the
 * screen and nothing upstream can tell.
 *
 * A block TYPE inside a drawer is not touched, the same as everywhere else:
 * `blocks` holds identifiers, and only an item that says it is a button or a
 * label has words in its `text`.
 */
export function localizeToolbox<T>(
  toolbox: T,
  translate: Translate = viaPlugin,
): T {
  if (Array.isArray(toolbox)) {
    return toolbox.map(item => localizeItem(item, translate)) as unknown as T;
  }
  return localizeItem(toolbox, translate) as T;
}

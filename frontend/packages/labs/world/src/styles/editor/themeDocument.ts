// Reading and writing a `.style` file, and the two questions the editor asks
// of every value in one.
//
// NO MODEL LAYER, unlike the effect editor's. A theme document IS the shape
// the engine reads (`engine/core/theme`, `ThemeDocument`) — tokens and styles
// and nothing else — so a second in-memory shape would be one more place for
// the two to drift. What is here is the handful of questions a form needs
// answering that the type alone does not: whether a value points at a token,
// and whether a token is a colour or a number.

import type {StyleSpec, ThemeDocument} from '../../engine/core/theme';

/** A reference as it is written in a file: `$accent`. */
const REFERENCE = /^\$(.+)$/;

export const tokenNamed = (value: unknown): string | undefined => {
  const match = typeof value === 'string' ? REFERENCE.exec(value) : null;
  return match ? match[1] : undefined;
};

export const asReference = (name: string): string => `$${name}`;

/**
 * Whether a token holds a colour.
 *
 * ASKED OF THE VALUE, because a theme declares no types: `radius` is 8 and
 * `accent` is `#3050a0`, and which editor a row gets follows from that. A
 * theme is a file a learner may hand-edit, so this has to answer for whatever
 * is actually in it rather than for what ought to be.
 */
export const isColorToken = (value: unknown): boolean =>
  typeof value === 'string';

/** Every token, in the order the file lists them. */
export const tokensOf = (
  document: ThemeDocument,
): Array<[string, string | number]> => Object.entries(document.tokens ?? {});

/** Every style, in the order the file lists them. */
export const stylesOf = (document: ThemeDocument): Array<[string, StyleSpec]> =>
  Object.entries(document.styles ?? {});

/** The same document with one token changed. Order is preserved. */
export function withToken(
  document: ThemeDocument,
  name: string,
  value: string | number,
): ThemeDocument {
  return {...document, tokens: {...document.tokens, [name]: value}};
}

/**
 * The same document with one FIELD of one style changed.
 *
 * `undefined` removes the field, which is not the same as setting it to null:
 * absent leaves the pen alone and null clears it, and the editor has to be
 * able to say both (`engine/core/theme`, `StyleSpec`).
 */
export function withStyleField(
  document: ThemeDocument,
  style: string,
  field: keyof StyleSpec,
  value: StyleSpec[keyof StyleSpec] | undefined,
): ThemeDocument {
  const current = document.styles?.[style] ?? {};
  const next: Record<string, unknown> = {...current};
  if (value === undefined) {
    delete next[field];
  } else {
    next[field] = value;
  }
  return {
    ...document,
    styles: {...document.styles, [style]: next as StyleSpec},
  };
}

/**
 * Read a file into a document.
 *
 * An EMPTY file is a new one — Codebridge makes them with no contents — and
 * gets an empty theme rather than an error. Anything else that will not parse
 * is reported, because quietly replacing a learner's broken file with a blank
 * one destroys the very thing they need to see (`effect/EffectFileEditor`
 * states the same bargain).
 */
export function readThemeDocument(
  contents: string,
): {document: ThemeDocument; error: null} | {document: null; error: string} {
  if (!contents.trim()) {
    return {document: {name: 'Theme', tokens: {}, styles: {}}, error: null};
  }
  try {
    const parsed: unknown = JSON.parse(contents);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {document: null, error: 'A theme is a JSON object.'};
    }
    return {document: parsed as ThemeDocument, error: null};
  } catch (error) {
    return {
      document: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** …and back to text, formatted as the stock themes are. */
export const writeThemeDocument = (document: ThemeDocument): string =>
  JSON.stringify(document, undefined, 2);

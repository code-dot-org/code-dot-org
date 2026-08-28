// The surgical .level file editor: the write-side inverse of parseLevelXml.
// Patches exactly the properties/blocks a change log names and leaves every
// other byte untouched — config fields the importer never reads (game_id,
// created_at, published, notes, audit_log, level_concept_difficulty, ...)
// and Blockly XML this project doesn't model (initialization_blocks,
// required_blocks).
//
// Full reparse-and-reprint (JSON.parse(cdata) -> JSON.stringify(obj, null,
// 2)) was measured and rejected as the general strategy: Ruby's
// JSON.pretty_generate renders an empty object/array as two lines
// (`{\n  }`), Node's JSON.stringify collapses it to one (`{}`). 4396 of the
// 9057 real .level files under dashboard/config/levels/custom (48.5%)
// carry at least one such empty value, so the naive round trip is
// byte-identical on barely half the corpus — see
// __tests__/levelFile.test.ts's 'measured decision' test, which reproduces
// that count. This module never reserializes the whole JSON document;
// every write is a text-range splice against the original bytes, so
// untouched keys — however they happen to be formatted — survive verbatim.

import {
  BLOCKS_PATTERN,
  CONFIG_PATTERN,
  namedBlocksPattern,
  ROOT_TAG_PATTERN,
  type ParsedLevelXml,
} from '../importer/levelXml.js';

/** A property patch: string values, `null` to delete the key. */
export type LevelFilePropertiesPatch = Record<string, string | null>;

/** A block-XML patch: verbatim `<xml>...</xml>` payloads, `null` to delete. */
export interface LevelFileBlocksPatch {
  startBlocksXml?: string | null;
  toolboxBlocksXml?: string | null;
  solutionBlocksXml?: string | null;
}

export interface LevelFilePatch {
  properties?: LevelFilePropertiesPatch;
  blocks?: LevelFileBlocksPatch;
}

/**
 * Applies `patch` to a `.level` file's raw XML text and returns the new
 * text. An empty patch reconstructs byte-identical input — the property
 * test in __tests__/levelFile.test.ts asserts exactly that across a real
 * sample, and it is what proves the span-finding below locates the right
 * bytes rather than merely echoing its input.
 */
export function patchLevelFile(
  originalXml: string,
  patch: LevelFilePatch = {},
): string {
  const configMatch = originalXml.match(CONFIG_PATTERN);
  if (!configMatch || configMatch.index === undefined) {
    throw new Error(
      'patchLevelFile: no <config><![CDATA[...]]></config> block found',
    );
  }
  const cdataText = configMatch[1];
  const cdataStart =
    originalXml.indexOf('<![CDATA[', configMatch.index) + '<![CDATA['.length;

  const patchedCdata = patchConfigJson(cdataText, patch.properties ?? {});
  let result =
    originalXml.slice(0, cdataStart) +
    patchedCdata +
    originalXml.slice(cdataStart + cdataText.length);

  if (patch.blocks) {
    result = patchBlocks(result, patch.blocks);
  }
  return result;
}

/**
 * Formatting-preserving inverse of parseLevelXml: reconstructs `original`
 * from a parse of it. `parsed` isn't itself enough to reconstruct
 * byte-exact bytes (parsing has already discarded the original spacing), so
 * this delegates to the same span-splicing patchLevelFile does with no
 * patch, and uses `parsed` only to catch a caller passing a parse that
 * doesn't actually belong to `original` (its levelType wouldn't match the
 * file's root tag) before returning a reconstruction whose correctness the
 * property test in __tests__/levelFile.test.ts checks directly.
 */
export function serializeLevelXml(
  parsed: ParsedLevelXml,
  original: string,
): string {
  const rootTagMatch = original.match(ROOT_TAG_PATTERN);
  if (!rootTagMatch || rootTagMatch[1] !== parsed.levelType) {
    throw new Error(
      'serializeLevelXml: parsed.levelType does not match the root tag of `original`',
    );
  }
  return patchLevelFile(original, {});
}

// ---------------------------------------------------------------------------
// <config> CDATA JSON: locate the "properties" entry, splice inside it only.
// ---------------------------------------------------------------------------

function patchConfigJson(
  cdataText: string,
  propertiesPatch: LevelFilePropertiesPatch,
): string {
  if (cdataText[0] !== '{') {
    throw new Error(
      'patchLevelFile: <config> CDATA does not start with a JSON object',
    );
  }
  const {entries} = scanObjectEntries(cdataText, 0);
  const propertiesEntry = entries.find(entry => entry.key === 'properties');
  if (!propertiesEntry) {
    if (Object.keys(propertiesPatch).length === 0) {
      return cdataText;
    }
    throw new Error('patchLevelFile: level has no top-level "properties" key');
  }
  if (cdataText[propertiesEntry.valueStart] !== '{') {
    throw new Error('patchLevelFile: "properties" value is not a JSON object');
  }

  const newProperties = patchObject(
    cdataText,
    propertiesEntry.valueStart,
    propertiesPatch,
  );
  return (
    cdataText.slice(0, propertiesEntry.valueStart) +
    newProperties +
    cdataText.slice(propertiesEntry.valueEnd)
  );
}

/** One direct key/value pair of a JSON object, located in the original text. */
interface JsonEntry {
  key: string;
  /** Start of this entry's own leading whitespace/key — contiguous with the
   * previous entry's `spanEnd` (or the object's opening brace + 1). */
  leadingStart: number;
  valueStart: number;
  /** Exclusive end of the value itself, before any trailing comma. */
  valueEnd: number;
  /** Exclusive end of this entry's span, past its trailing comma if present. */
  spanEnd: number;
}

/**
 * Walks the direct (depth-1) key/value pairs of the JSON object opening at
 * `text[objOpenIdx] === '{'`. Nested strings/objects/arrays inside a value
 * are skipped as opaque spans (via scanJsonValue), so this never looks
 * inside a nested structure — exactly what's needed to touch only
 * `properties`' own keys and leave a value like `serialized_maze` (a JSON
 * string with escaped quotes) untouched.
 */
function scanObjectEntries(
  text: string,
  objOpenIdx: number,
): {entries: JsonEntry[]; objCloseIdx: number} {
  const entries: JsonEntry[] = [];
  let i = objOpenIdx + 1;
  for (;;) {
    const leadingStart = i;
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    if (text[i] === '}') {
      return {entries, objCloseIdx: i};
    }
    if (text[i] !== '"') {
      throw new Error(`patchLevelFile: expected an object key at index ${i}`);
    }
    const keyStart = i;
    const keyEnd = scanJsonValue(text, keyStart);
    const key = JSON.parse(text.slice(keyStart, keyEnd)) as string;
    i = keyEnd;
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    if (text[i] !== ':') {
      throw new Error(
        `patchLevelFile: expected ':' after key "${key}" at index ${i}`,
      );
    }
    i++;
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    const valueStart = i;
    const valueEnd = scanJsonValue(text, valueStart);
    i = valueEnd;
    let spanEnd = valueEnd;
    while (i < text.length && (text[i] === ' ' || text[i] === '\t')) {
      i++;
    }
    if (text[i] === ',') {
      i++;
      spanEnd = i;
    }
    entries.push({key, leadingStart, valueStart, valueEnd, spanEnd});
  }
}

/**
 * Returns the index just past the JSON value starting at `start` (which must
 * point at its first character). Objects/arrays are matched by tracking only
 * their own bracket character — `{`/`}` for an object, `[`/`]` for an array —
 * which is sufficient because a string's contents are always fully skipped
 * first (via the same function, recursively), so a stray bracket-looking
 * character inside a string, or a nested value of the other bracket type,
 * never perturbs the count.
 */
function scanJsonValue(text: string, start: number): number {
  const ch = text[start];
  if (ch === '"') {
    let i = start + 1;
    while (i < text.length) {
      if (text[i] === '\\') {
        i += 2;
        continue;
      }
      if (text[i] === '"') {
        return i + 1;
      }
      i++;
    }
    throw new Error(`patchLevelFile: unterminated string at index ${start}`);
  }
  if (ch === '{' || ch === '[') {
    const close = ch === '{' ? '}' : ']';
    let depth = 1;
    let i = start + 1;
    while (i < text.length && depth > 0) {
      const c = text[i];
      if (c === '"') {
        i = scanJsonValue(text, i);
        continue;
      }
      if (c === ch) {
        depth++;
      } else if (c === close) {
        depth--;
      }
      i++;
    }
    if (depth !== 0) {
      throw new Error(`patchLevelFile: unbalanced ${ch} at index ${start}`);
    }
    return i;
  }
  // number / true / false / null: read up to the next structural delimiter.
  let i = start;
  while (i < text.length && !/[,}\]\s]/.test(text[i])) {
    i++;
  }
  return i;
}

/** Indentation of the line containing `idx`. */
function inferLineIndent(text: string, idx: number): string {
  const lineStart = text.lastIndexOf('\n', idx - 1) + 1;
  return /^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? '';
}

/**
 * Applies a `{key: value|null}` patch to the JSON object opening at
 * `text[objOpenIdx] === '{'` and returns the whole new `{...}` text.
 * Untouched entries are copied by slicing the original bytes (key, colon,
 * whitespace, value, comma) — never rebuilt from parsed data — so an empty
 * patch reproduces the object byte-for-byte and an edit changes only the
 * entries it names.
 */
function patchObject(
  text: string,
  objOpenIdx: number,
  patch: Record<string, string | null>,
): string {
  const {entries, objCloseIdx} = scanObjectEntries(text, objOpenIdx);
  const remaining = new Set(Object.keys(patch));
  const parts: {leading: string; value: string}[] = [];

  for (const entry of entries) {
    const leading = text.slice(entry.leadingStart, entry.valueStart);
    if (Object.prototype.hasOwnProperty.call(patch, entry.key)) {
      remaining.delete(entry.key);
      const newValue = patch[entry.key];
      if (newValue === null) {
        continue; // delete: this entry contributes nothing
      }
      parts.push({leading, value: JSON.stringify(newValue)});
    } else {
      parts.push({leading, value: text.slice(entry.valueStart, entry.valueEnd)});
    }
  }

  const wasEmpty = entries.length === 0;
  const childIndent = `${inferLineIndent(text, objOpenIdx)}  `;
  for (const key of remaining) {
    const value = patch[key];
    if (value === null || value === undefined) {
      continue; // deleting a key that was never present is a no-op
    }
    parts.push({
      leading: `\n${childIndent}${JSON.stringify(key)}: `,
      value: JSON.stringify(value),
    });
  }

  const lastSpanEnd =
    entries.length > 0 ? entries[entries.length - 1].spanEnd : objOpenIdx + 1;
  const originalClosingGap = text.slice(lastSpanEnd, objCloseIdx);
  const closingGap =
    wasEmpty && parts.length > 0
      ? `\n${inferLineIndent(text, objOpenIdx)}`
      : originalClosingGap;

  const interior = parts
    .map(
      (part, i) => `${part.leading}${part.value}${i < parts.length - 1 ? ',' : ''}`,
    )
    .join('');
  return `{${interior}${closingGap}}`;
}

// ---------------------------------------------------------------------------
// <blocks> sibling: splice one named child's verbatim <xml>...</xml> payload.
// ---------------------------------------------------------------------------

const BLOCK_TAGS: Record<keyof LevelFileBlocksPatch, string> = {
  startBlocksXml: 'start_blocks',
  toolboxBlocksXml: 'toolbox_blocks',
  solutionBlocksXml: 'solution_blocks',
};

function patchBlocks(xml: string, patch: LevelFileBlocksPatch): string {
  let result = xml;
  for (const patchKey of Object.keys(BLOCK_TAGS) as (keyof LevelFileBlocksPatch)[]) {
    const value = patch[patchKey];
    if (value === undefined) {
      continue;
    }
    result = patchNamedBlock(result, BLOCK_TAGS[patchKey], value);
  }
  return result;
}

function patchNamedBlock(
  xml: string,
  tagName: string,
  newXml: string | null,
): string {
  const match = xml.match(namedBlocksPattern(tagName));
  if (match && match.index !== undefined) {
    if (newXml === null) {
      return deleteNamedBlock(xml, match.index, match[0].length);
    }
    const innerStart = xml.indexOf('<xml', match.index);
    const innerText = match[1];
    return (
      xml.slice(0, innerStart) + newXml + xml.slice(innerStart + innerText.length)
    );
  }
  if (newXml === null) {
    return xml; // deleting a block that was never present is a no-op
  }
  return insertNamedBlock(xml, tagName, newXml);
}

/** Removes a `<tagName>...</tagName>` child, plus its own indentation and
 * one preceding newline, so the sibling list doesn't grow a blank line. */
function deleteNamedBlock(xml: string, start: number, length: number): string {
  const end = start + length;
  let leadStart = start;
  while (leadStart > 0 && (xml[leadStart - 1] === ' ' || xml[leadStart - 1] === '\t')) {
    leadStart--;
  }
  if (leadStart > 0 && xml[leadStart - 1] === '\n') {
    leadStart--;
  }
  return xml.slice(0, leadStart) + xml.slice(end);
}

function insertNamedBlock(xml: string, tagName: string, newXml: string): string {
  const blocksMatch = xml.match(BLOCKS_PATTERN);
  if (!blocksMatch || blocksMatch.index === undefined) {
    throw new Error(
      `patchLevelFile: cannot add <${tagName}> — no <blocks> element in this file`,
    );
  }
  const blocksStart = blocksMatch.index;
  const blocksText = blocksMatch[0];
  const selfClosing = /^<blocks\s*\/>$/.test(blocksText);
  const indent = inferLineIndent(xml, blocksStart);
  const childIndent = `${indent}  `;
  const newChild = `\n${childIndent}<${tagName}>${newXml}</${tagName}>`;

  const replaced = selfClosing
    ? `<blocks>${newChild}\n${indent}</blocks>`
    : spliceBeforeClosingTag(blocksText, '</blocks>', `${newChild}\n${indent}`);
  return xml.slice(0, blocksStart) + replaced + xml.slice(blocksStart + blocksText.length);
}

function spliceBeforeClosingTag(
  text: string,
  closeTag: string,
  insertion: string,
): string {
  const closeIdx = text.lastIndexOf(closeTag);
  if (closeIdx === -1) {
    throw new Error(`patchLevelFile: expected a closing ${closeTag}`);
  }
  return text.slice(0, closeIdx) + insertion + text.slice(closeIdx);
}

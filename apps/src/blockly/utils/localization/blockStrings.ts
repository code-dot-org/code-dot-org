import localization from '@cdo/apps/localization';

const LOCALIZE_BLOCK_STRINGS_BLOCKS = [
  'gamelab_showTitleScreen',
  'gamelab_spriteSayTime',
  'gamelab_spriteSay',
  'gamelab_setPrompt',
  'gamelab_printText',
  'gamelab_setPromptWithChoices',
];

const LOCALIZE_BLOCK_JOIN_BLOCKS = ['gamelab_textJoin'];

const LOCALIZE_BLOCK_JOIN_VARIABLE_BLOCKS = ['gamelab_textVariableJoin'];

const STRING_LABELS = ['blockly-block', 'gamelab-string'];

// A flattened piece of a textJoin chain: either a static text run or a
// placeholder for a variable-join block. For variable tokens we retain the
// original block element so its mutations, titles, and attributes can be
// re-emitted in the reassembled chain.
type ChainToken = {kind: 'text'; text: string} | {kind: 'var'; block: Element};

function directChildren(el: Element, tagName: string): Element[] {
  return Array.from(el.children).filter(
    c => c.tagName.toLowerCase() === tagName.toLowerCase()
  );
}

function inputBlock(valueEl: Element): Element | null {
  return directChildren(valueEl, 'block')[0] || null;
}

// Blockly XML has two equivalent spellings for field elements: <title> in the
// older dialect (as in example.xml) and <field> in the modern dialect (as in
// example2.xml). A single document generally uses one consistently, but we
// accept either on reads and emit whichever the document is already using.
const FIELD_TAGS = ['field', 'title'];

function findField(el: Element, name: string): Element | null {
  for (const child of Array.from(el.children)) {
    if (
      FIELD_TAGS.includes(child.tagName.toLowerCase()) &&
      child.getAttribute('name') === name
    ) {
      return child;
    }
  }
  return null;
}

function fieldText(el: Element, name: string): string {
  return findField(el, name)?.textContent || '';
}

function setFieldText(el: Element, name: string, value: string): void {
  const field = findField(el, name);
  if (field) {
    field.textContent = value;
  }
}

// Detect the field spelling the document uses so rebuilt chains match.
function detectFieldTag(doc: Document): string {
  return doc.querySelector('field') ? 'field' : 'title';
}

// Follow the TEXT2 value input to the next block in the chain.
function nextChainBlock(el: Element): Element | null {
  for (const value of directChildren(el, 'value')) {
    if (value.getAttribute('name') === 'TEXT2') {
      return inputBlock(value);
    }
  }
  return null;
}

// Walk the textJoin / textVariableJoin / text chain and produce an ordered
// stream of text runs and variable placeholders.
function flattenChain(block: Element): ChainToken[] {
  const tokens: ChainToken[] = [];
  let current: Element | null = block;
  while (current) {
    const type = current.getAttribute('type') || '';
    if (LOCALIZE_BLOCK_JOIN_BLOCKS.includes(type)) {
      tokens.push({kind: 'text', text: fieldText(current, 'TEXT1')});
      current = nextChainBlock(current);
    } else if (LOCALIZE_BLOCK_JOIN_VARIABLE_BLOCKS.includes(type)) {
      tokens.push({kind: 'var', block: current});
      current = nextChainBlock(current);
    } else if (type === 'text') {
      tokens.push({kind: 'text', text: fieldText(current, 'TEXT')});
      current = null;
    } else {
      // Anything else (variables_get, a function call, etc.) ends flattening
      // since we cannot safely re-emit it inside a rebuilt chain.
      current = null;
    }
  }
  return normalizeTokens(tokens);
}

// Merge adjacent text runs and guarantee the sequence begins and ends with a
// text token so the builder can always pair them with variable tokens.
function normalizeTokens(tokens: ChainToken[]): ChainToken[] {
  const merged: ChainToken[] = [];
  for (const tok of tokens) {
    const prev = merged[merged.length - 1];
    if (tok.kind === 'text' && prev && prev.kind === 'text') {
      prev.text += tok.text;
    } else {
      merged.push(tok);
    }
  }
  if (merged.length === 0 || merged[0].kind !== 'text') {
    merged.unshift({kind: 'text', text: ''});
  }
  if (merged[merged.length - 1].kind !== 'text') {
    merged.push({kind: 'text', text: ''});
  }
  return merged;
}

// Render the token stream as a source string with %1, %2, ... in place of
// variable tokens. Returns the string alongside the ordered variable blocks
// those placeholders refer to.
function chainToSourceString(tokens: ChainToken[]): {
  source: string;
  vars: Element[];
} {
  const vars: Element[] = [];
  const pieces: string[] = [];
  for (const tok of tokens) {
    if (tok.kind === 'text') {
      pieces.push(tok.text);
    } else {
      vars.push(tok.block);
      pieces.push(`%${vars.length}`);
    }
  }
  return {source: pieces.join(''), vars};
}

// Split a translated string back into tokens, resolving %N against the
// ordered variable blocks from the original chain.
function parseTranslated(translated: string, vars: Element[]): ChainToken[] {
  const tokens: ChainToken[] = [];
  const regex = /%(\d+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(translated)) !== null) {
    tokens.push({
      kind: 'text',
      text: translated.slice(lastIndex, match.index),
    });
    const idx = parseInt(match[1], 10) - 1;
    if (idx >= 0 && idx < vars.length) {
      tokens.push({kind: 'var', block: vars[idx]});
    } else {
      // Placeholder is out of range; keep the raw %N so a developer notices.
      tokens.push({kind: 'text', text: match[0]});
    }
    lastIndex = regex.lastIndex;
  }
  tokens.push({kind: 'text', text: translated.slice(lastIndex)});
  return normalizeTokens(tokens);
}

// Shallow-clone a variable-join block, preserving its attributes and field
// children but dropping the TEXT2 continuation so the caller can splice in
// the new continuation from the rebuilt chain.
function cloneVarHeader(block: Element): Element {
  const clone = block.cloneNode(false) as Element;
  for (const child of Array.from(block.children)) {
    const tag = child.tagName.toLowerCase();
    if (FIELD_TAGS.includes(tag) || tag === 'mutation') {
      clone.appendChild(child.cloneNode(true));
    }
  }
  return clone;
}

function makeTextBlock(doc: Document, fieldTag: string, text: string): Element {
  const block = doc.createElement('block');
  block.setAttribute('type', 'text');
  const field = doc.createElement(fieldTag);
  field.setAttribute('name', 'TEXT');
  field.textContent = text;
  block.appendChild(field);
  return block;
}

// Recursively build a new chain from a normalized token stream. Tokens always
// arrive as text, (var, text)*, so each recursive step consumes a (text, var)
// pair and descends into the remainder, or terminates with a lone text block.
function buildChain(
  doc: Document,
  fieldTag: string,
  tokens: ChainToken[]
): Element {
  if (tokens.length === 1 && tokens[0].kind === 'text') {
    return makeTextBlock(doc, fieldTag, tokens[0].text);
  }

  const first = tokens[0];
  const varTok = tokens[1];
  const rest = tokens.slice(2);
  const firstText = first.kind === 'text' ? first.text : '';

  const joinBlock = doc.createElement('block');
  joinBlock.setAttribute('type', LOCALIZE_BLOCK_JOIN_BLOCKS[0]);
  const field1 = doc.createElement(fieldTag);
  field1.setAttribute('name', 'TEXT1');
  field1.textContent = firstText;
  joinBlock.appendChild(field1);

  const outerValue = doc.createElement('value');
  outerValue.setAttribute('name', 'TEXT2');

  const varHeader =
    varTok && varTok.kind === 'var'
      ? cloneVarHeader(varTok.block)
      : doc.createElement('block');
  const innerValue = doc.createElement('value');
  innerValue.setAttribute('name', 'TEXT2');
  innerValue.appendChild(buildChain(doc, fieldTag, rest));
  varHeader.appendChild(innerValue);

  outerValue.appendChild(varHeader);
  joinBlock.appendChild(outerValue);
  return joinBlock;
}

function replaceInputBlock(valueEl: Element, newBlock: Element): void {
  const existing = inputBlock(valueEl);
  if (existing) {
    valueEl.replaceChild(newBlock, existing);
  } else {
    valueEl.appendChild(newBlock);
  }
}

function localizeValueInput(
  valueEl: Element,
  doc: Document,
  fieldTag: string,
  translations: Map<string, string>,
  processed: Set<Element>
): void {
  const innerBlock = inputBlock(valueEl);
  if (!innerBlock) return;
  const type = innerBlock.getAttribute('type') || '';

  if (type === 'text') {
    const source = fieldText(innerBlock, 'TEXT');
    if (source === '') return;
    const translated = localization.translate(source, STRING_LABELS);
    setFieldText(innerBlock, 'TEXT', translated);
    translations.set(source, translated);
    processed.add(innerBlock);
    return;
  }

  if (LOCALIZE_BLOCK_JOIN_BLOCKS.includes(type)) {
    const tokens = flattenChain(innerBlock);
    const {source, vars} = chainToSourceString(tokens);
    if (source === '') return;
    const translated = localization.translate(source, STRING_LABELS);
    const rebuilt = buildChain(
      doc,
      fieldTag,
      parseTranslated(translated, vars)
    );
    replaceInputBlock(valueEl, rebuilt);
  }
}

/**
 * Takes the XML that is meant to be serialized and replaces the string
 * inputs to certain blocks, defined by the LOCALIZE_BLOCK_STRINGS_BLOCKS
 * array, with translated versions of those strings. It returns the reformed
 * XML so that it is what gets serialized instead.
 *
 * Plain <block type="text"> inputs to qualifying blocks drive the set of
 * translatable strings. After processing those, we propagate their
 * translations to any other <block type="text"> in the program whose TEXT
 * matches a known source string, so identical literals stay consistent
 * regardless of where the user wired them.
 */
export function localizeBlockStrings(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) {
    return xml;
  }

  const fieldTag = detectFieldTag(doc);
  const translations = new Map<string, string>();
  const processed = new Set<Element>();

  for (const block of Array.from(doc.querySelectorAll('block'))) {
    const type = block.getAttribute('type') || '';
    if (!LOCALIZE_BLOCK_STRINGS_BLOCKS.includes(type)) continue;
    for (const valueEl of directChildren(block, 'value')) {
      localizeValueInput(valueEl, doc, fieldTag, translations, processed);
    }
  }

  // Propagate the translations we already performed to every other plain
  // text block in the program. Only exact-match sources are translated:
  // we never send a fresh string, so asset names and other literals that
  // happen to live in text blocks pass through untouched.
  for (const block of Array.from(doc.querySelectorAll('block[type="text"]'))) {
    if (processed.has(block)) continue;
    const source = fieldText(block, 'TEXT');
    const translated = translations.get(source);
    if (translated !== undefined && translated !== source) {
      setFieldText(block, 'TEXT', translated);
    }
  }

  return new XMLSerializer().serializeToString(doc);
}

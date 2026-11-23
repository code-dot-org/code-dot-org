// Translates the strings that Sprite Lab start blocks say, print or prompt.
// A gamelab_textJoin chain is one sentence split across blocks, with
// gamelab_textVariableJoin blocks for its variables. It is translated as a
// single string with %N per variable, then rebuilt in the translation's order.

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

type ChainToken = {kind: 'text'; text: string} | {kind: 'var'; block: Element};

function directChildren(el: Element, tagName: string): Element[] {
  return Array.from(el.children).filter(
    c => c.tagName.toLowerCase() === tagName.toLowerCase()
  );
}

function inputBlock(valueEl: Element): Element | null {
  return directChildren(valueEl, 'block')[0] || null;
}

// Older Blockly XML spells a field <title>.
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

function detectFieldTag(doc: Document): string {
  return doc.querySelector('field') ? 'field' : 'title';
}

function nextChainBlock(el: Element): Element | null {
  for (const value of directChildren(el, 'value')) {
    if (value.getAttribute('name') === 'TEXT2') {
      return inputBlock(value);
    }
  }
  return null;
}

// The rebuild reproduces only fields, a mutation and a TEXT2 block; a
// shadow, next connection or comment would be lost.
function isRebuildable(el: Element, allowMutation: boolean): boolean {
  for (const child of Array.from(el.children)) {
    const tag = child.tagName.toLowerCase();
    if (FIELD_TAGS.includes(tag)) continue;
    if (tag === 'mutation' && allowMutation) continue;
    if (tag === 'value' && child.getAttribute('name') === 'TEXT2') {
      const inner = Array.from(child.children);
      if (
        inner.length === 0 ||
        (inner.length === 1 && inner[0].tagName.toLowerCase() === 'block')
      ) {
        continue;
      }
    }
    return false;
  }
  return true;
}

// joins and tail are the original blocks whose attributes the rebuilt blocks
// inherit.
type Chain = {tokens: ChainToken[]; joins: Element[]; tail: Element | null};

// Returns null when the chain holds anything the rebuild cannot reproduce.
function flattenChain(block: Element): Chain | null {
  const tokens: ChainToken[] = [];
  const joins: Element[] = [];
  let tail: Element | null = null;
  let current: Element | null = block;
  while (current) {
    const type = current.getAttribute('type') || '';
    if (LOCALIZE_BLOCK_JOIN_BLOCKS.includes(type)) {
      if (!isRebuildable(current, false)) return null;
      tokens.push({kind: 'text', text: fieldText(current, 'TEXT1')});
      joins.push(current);
      current = nextChainBlock(current);
    } else if (LOCALIZE_BLOCK_JOIN_VARIABLE_BLOCKS.includes(type)) {
      if (!isRebuildable(current, true)) return null;
      tokens.push({kind: 'var', block: current});
      current = nextChainBlock(current);
    } else if (type === 'text') {
      if (!isRebuildable(current, false)) return null;
      tokens.push({kind: 'text', text: fieldText(current, 'TEXT')});
      tail = current;
      current = null;
    } else {
      // A variables_get or call has no TEXT2, so it can only end a chain and
      // a translation that moves it cannot be built.
      return null;
    }
  }
  return {tokens: normalizeTokens(tokens), joins, tail};
}

// The result alternates text, var, text, ..., starting and ending with text.
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
      // An out-of-range %N stays visible as text.
      tokens.push({kind: 'text', text: match[0]});
    }
    lastIndex = regex.lastIndex;
  }
  tokens.push({kind: 'text', text: translated.slice(lastIndex)});
  return normalizeTokens(tokens);
}

// Copies a variable-join block without its TEXT2 input.
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

// A rebuilt block with no original counterpart takes the chain head's
// attributes minus its id, so lock flags such as deletable="false" apply.
function inheritAttributes(
  block: Element,
  original: Element | undefined | null,
  fallback: Element | undefined
): void {
  const source = original || fallback;
  if (!source) return;
  for (const attr of Array.from(source.attributes)) {
    if (attr.name === 'type') continue;
    if (!original && attr.name === 'id') continue;
    block.setAttribute(attr.name, attr.value);
  }
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

// The k-th join built inherits the attributes of the k-th original join.
function buildChain(
  doc: Document,
  fieldTag: string,
  tokens: ChainToken[],
  chain: Chain,
  depth: number = 0
): Element {
  if (tokens.length === 1 && tokens[0].kind === 'text') {
    const textBlock = makeTextBlock(doc, fieldTag, tokens[0].text);
    inheritAttributes(textBlock, chain.tail, chain.joins[0]);
    return textBlock;
  }

  const first = tokens[0];
  const varTok = tokens[1];
  const rest = tokens.slice(2);
  const firstText = first.kind === 'text' ? first.text : '';

  const joinBlock = doc.createElement('block');
  joinBlock.setAttribute('type', LOCALIZE_BLOCK_JOIN_BLOCKS[0]);
  inheritAttributes(joinBlock, chain.joins[depth], chain.joins[0]);
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
  innerValue.appendChild(buildChain(doc, fieldTag, rest, chain, depth + 1));
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
    const chain = flattenChain(innerBlock);
    if (!chain) return;
    const {source, vars} = chainToSourceString(chain.tokens);
    if (source === '') return;
    const translated = localization.translate(source, STRING_LABELS);
    const rebuilt = buildChain(
      doc,
      fieldTag,
      parseTranslated(translated, vars),
      chain
    );
    replaceInputBlock(valueEl, rebuilt);
  }
}

/**
 * Returns start-block XML with the strings given to the blocks in
 * LOCALIZE_BLOCK_STRINGS_BLOCKS translated. Any other text block holding
 * one of those same strings gets the same translation. JSON, or XML that
 * does not parse, is returned unchanged.
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

  // Only strings already translated above are reused, so asset names and
  // other text-block literals are never sent for translation.
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

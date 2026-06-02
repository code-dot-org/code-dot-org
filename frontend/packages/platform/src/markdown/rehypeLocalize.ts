import type {Element, ElementContent, Nodes, Root} from 'hast';
import {fromHtml} from 'hast-util-from-html';
import {toHtml} from 'hast-util-to-html';

/**
 * Localizes block-level text without confusing the translator.
 *
 * Our translation engine refuses to translate a block that contains Blockly XML
 * (`<xml>`, `<block>`, ...) or other non-phrasing elements, even when the block
 * is marked for isolation. This plugin works around that on the hast tree,
 * before sanitization:
 *
 *   1. Within each block (default `<p>`), every element the translator cannot
 *      handle is hidden behind an empty placeholder span and stashed verbatim;
 *      every element it mishandles (default `<code>`) is renamed to a tag it
 *      accepts (default `<span>`), to be restored afterward.
 *   2. The block's inner HTML is serialized and handed to the injected
 *      `translate`.
 *   3. The translated HTML is reparsed and the placeholders / renamed tags are
 *      restored, leaving the stashed elements byte-for-byte unchanged.
 *
 * The stashed and reparsed nodes still pass through sanitization afterward, so
 * the trust boundary is unchanged. This replaces the legacy approach of
 * building a detached DOM tree from rendered React and walking it back.
 */
export interface RehypeLocalizeOptions {
  /** Translate a fragment of inline HTML, preserving element structure. */
  translate: (html: string) => string;
  /** Block elements whose inline content is localized. Default: `['p']`. */
  blockTags?: string[];
  /**
   * Inline tags the translator handles directly; their text is translated in
   * place. Anything else inside a block is hidden behind a placeholder and
   * restored verbatim.
   */
  inlineTags?: string[];
  /**
   * Tags the translator mishandles but whose text should still translate: each
   * is rewritten to the given tag for translation, then restored. Default:
   * `{code: 'span'}`.
   */
  renameTags?: Record<string, string>;
}

// Phrasing/inline tags a translator can reason about directly.
const DEFAULT_INLINE_TAGS = [
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'data',
  'dfn',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
];

// hast property names (camelCase) for our internal markers.
const TOKEN_PROP = 'dataLocalizeToken';
const RENAME_PROP = 'dataLocalizeRename';

const isElement = (node: ElementContent): node is Element =>
  node.type === 'element';

const rehypeLocalize = (options: RehypeLocalizeOptions) => (tree: Root) => {
  const {
    translate,
    blockTags = ['p'],
    inlineTags = DEFAULT_INLINE_TAGS,
    renameTags = {code: 'span'},
  } = options;
  const blocks = new Set(blockTags);
  const inline = new Set(inlineTags);

  // Replace, in place, every element the translator can't see: opaque
  // elements become placeholders (stashed verbatim), renamed elements get a
  // restore marker. Returns the transformed node.
  const conceal = (node: ElementContent, stash: Element[]): ElementContent => {
    if (!isElement(node)) {
      return node;
    }
    const renameTo = renameTags[node.tagName];
    if (renameTo) {
      return {
        ...node,
        tagName: renameTo,
        properties: {...node.properties, [RENAME_PROP]: node.tagName},
        children: node.children.map(child => conceal(child, stash)),
      };
    }
    if (!inline.has(node.tagName)) {
      const index = stash.length;
      stash.push(node);
      return {
        type: 'element',
        tagName: 'span',
        properties: {[TOKEN_PROP]: String(index)},
        children: [],
      };
    }
    return {
      ...node,
      children: node.children.map(child => conceal(child, stash)),
    };
  };

  // Undo conceal() on the reparsed translation: placeholders become their
  // stashed element again, renamed tags revert to their original name.
  const reveal = (node: ElementContent, stash: Element[]): ElementContent => {
    if (!isElement(node)) {
      return node;
    }
    const token = node.properties?.[TOKEN_PROP];
    if (token !== undefined && token !== null) {
      return stash[Number(token)];
    }
    const original = node.properties?.[RENAME_PROP];
    if (typeof original === 'string') {
      const {[RENAME_PROP]: _drop, ...properties} = node.properties ?? {};
      return {
        ...node,
        tagName: original,
        properties,
        children: node.children.map(child => reveal(child, stash)),
      };
    }
    return {
      ...node,
      children: node.children.map(child => reveal(child, stash)),
    };
  };

  const localizeBlock = (block: Element): void => {
    const stash: Element[] = [];
    const concealed = block.children.map(child => conceal(child, stash));
    const translated = translate(toHtml(concealed));
    const reparsed = fromHtml(translated, {fragment: true});
    // A translated fragment yields only phrasing content (no doctype).
    block.children = (reparsed.children as ElementContent[]).map(child =>
      reveal(child, stash),
    );
  };

  // Walk the tree; localize each block and do not descend into it (we handle
  // its subtree ourselves).
  const walk = (node: Nodes): void => {
    if (node.type === 'element' && blocks.has(node.tagName)) {
      localizeBlock(node);
      return;
    }
    if ('children' in node) {
      node.children.forEach(child => walk(child));
    }
  };

  walk(tree);
};

export default rehypeLocalize;

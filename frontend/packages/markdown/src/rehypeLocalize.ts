import type {Element, ElementContent, Nodes, Root} from 'hast';
import {fromHtml} from 'hast-util-from-html';
import {toHtml} from 'hast-util-to-html';

/**
 * Localizes block-level text without confusing the translator.
 *
 * Our translation engine refuses to translate a block that contains Blockly XML
 * (`<xml>`, `<block>`, ...) or other non-phrasing elements, even when the block
 * is marked for isolation. This plugin works around that on the hast tree.
 *
 * The caller must run it between two sanitization passes — sanitized before
 * (step 2 below serializes the block and reparses it through a live DOM inside
 * the translator, so that content has to be safe going in) and sanitized again
 * after (the translator's reparsed output is otherwise untrusted). Then:
 *
 *   1. Within each block (default `<p>`), every element the translator cannot
 *      handle is replaced by a `<code>` placeholder carrying its stash index,
 *      and the original is stashed verbatim. The translator ignores `<code>`,
 *      so the placeholder — and the token index inside it — survive untouched
 *      and can't be localized by accident. (That same blind spot is why real
 *      `<code>` is *renamed*, default to `<span>`, so its own text still gets
 *      translated.)
 *   2. The block's inner HTML is serialized and handed to the injected
 *      `translate`.
 *   3. The translated HTML is reparsed and the placeholders / renamed tags are
 *      restored, leaving the stashed elements byte-for-byte unchanged.
 *
 * Sanitized on both sides, the trust boundary holds: the block HTML is safe
 * when it reaches the live DOM, and the translator's output is constrained
 * before it renders. This replaces the legacy approach of building a detached
 * DOM tree from rendered React and walking it back.
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

// Placeholder element for stashed content. <code> is deliberate: the translator
// leaves <code> untouched, so the placeholder and its token survive verbatim
// and the token index is never localized.
const TOKEN_TAG = 'code';

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
        tagName: TOKEN_TAG,
        properties: {[TOKEN_PROP]: String(index)},
        children: [{type: 'text', value: String(index)}],
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

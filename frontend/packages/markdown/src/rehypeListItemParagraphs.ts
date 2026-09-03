import type {ElementContent, Nodes, Root} from 'hast';

/*
 * Phrasing (inline) tags. Everything not listed is treated as block-level and
 * left alone, which is the safe default in both directions: an unknown tag here
 * is almost always a block-level custom element introduced by an extension
 * (`<callout>`, `<details>`), and mistaking a phrasing tag for a block only
 * splits a paragraph in two rather than producing invalid nesting.
 */
const PHRASING_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'button',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'i',
  'img',
  'input',
  'kbd',
  'label',
  'mark',
  'q',
  's',
  'samp',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'textarea',
  'time',
  'u',
  'var',
  'wbr',
]);

const isPhrasing = (node: ElementContent): boolean =>
  node.type === 'text' ||
  (node.type === 'element' && PHRASING_TAGS.has(node.tagName));

// Whitespace-only text (the newlines remark-rehype puts between an item's text
// and a nested list) is not content: it may ride along inside a paragraph, but
// it never justifies creating one.
const isContent = (node: ElementContent): boolean =>
  node.type !== 'text' || node.value.trim() !== '';

/**
 * Wraps a list item's bare phrasing content in a paragraph.
 *
 * A "tight" markdown list (`- one`, with no blank line between items) puts its
 * item text directly in the `<li>`; only a "loose" list gets a `<p>`. Raw HTML
 * items (`<li>text</li>`, common in our curriculum) likewise have none. That
 * paragraph is what carries the body type scale and what marks a runtime
 * translation unit, so without it a tight item renders in whatever font it
 * inherits and is skipped by localization, while its loose neighbor is styled
 * and translated. This normalizes the two: after this plugin every list item
 * holds block-level content, as a loose item already did.
 *
 * Runs on hast (not mdast) so that raw HTML items are covered too, and before
 * sanitization so the paragraphs it inserts are subject to the allowlist.
 *
 * Consecutive phrasing children are grouped, so an item that mixes text with a
 * nested list — `<li>text<ul>...</ul></li>` — keeps the list a sibling of the
 * new paragraph rather than being swallowed by it.
 */
const rehypeListItemParagraphs = () => (tree: Root) => {
  const wrapChildren = (children: ElementContent[]): ElementContent[] => {
    const out: ElementContent[] = [];
    let run: ElementContent[] = [];

    const flush = () => {
      if (run.length === 0) {
        return;
      }
      if (run.some(isContent)) {
        out.push({
          type: 'element',
          tagName: 'p',
          properties: {},
          children: run,
        });
      } else {
        out.push(...run);
      }
      run = [];
    };

    for (const child of children) {
      if (isPhrasing(child)) {
        run.push(child);
      } else {
        flush();
        out.push(child);
      }
    }
    flush();
    return out;
  };

  const walk = (node: Nodes): void => {
    if (node.type === 'element' && node.tagName === 'li') {
      node.children = wrapChildren(node.children);
    }
    if ('children' in node) {
      node.children.forEach(child => walk(child));
    }
  };

  walk(tree);
};

export default rehypeListItemParagraphs;

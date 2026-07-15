import type {MarkdownExtension} from '../../extension';

import {type MdastNode, visit} from '../mdast';

/*
 * CommonMark requires a space after the leading '#'s for an ATX heading, so
 * `###Title` (no space) parses as a paragraph. Legacy code.org markdown (the
 * `marked`-based renderer) was lenient and rendered it as a heading, and
 * curriculum content relies on this — commonly as `###<i class="fa-..."></i>
 * Title`, where an icon immediately follows the '#'s.
 *
 * This transformer restores that leniency: a paragraph whose leading text is 1
 * to 6 '#'s (7+ is not a heading in CommonMark either, so it is left alone)
 * becomes a heading of the matching depth, with the '#'s stripped.
 *
 * It runs on the parsed tree, not the raw source, so '#'-prefixed lines inside
 * code blocks — Python comments, C preprocessor directives — are untouched:
 * those are `code` nodes, never paragraphs. Well-formed headings (`### Title`)
 * are already parsed as heading nodes, so they never reach this visitor.
 */
const lenientHeadingsSyntax = () => (tree: MdastNode) => {
  visit(tree, 'paragraph', node => {
    const first = node.children?.[0];
    if (!first || first.type !== 'text' || typeof first.value !== 'string') {
      return;
    }

    // Leading 1-6 '#'s not followed by a 7th (which would exceed the heading
    // range). The following character, if any, is non-space — a space would
    // have made this a heading already, not a paragraph.
    const match = first.value.match(/^(#{1,6})(?!#)/);
    if (!match) {
      return;
    }

    const depth = match[1].length;
    // Strip the '#'s; the rest of the line, plus any following inline nodes
    // (e.g. the icon), becomes the heading content.
    first.value = first.value.slice(depth);

    const heading = node as MdastNode & {depth: number};
    heading.type = 'heading';
    heading.depth = depth;
  });
};

/**
 * Restores legacy leniency for ATX headings written without a space after the
 * '#'s (`###Title`). See the transformer above.
 */
export const lenientHeadings: MarkdownExtension = {
  name: 'lenientHeadings',
  remarkPlugins: [lenientHeadingsSyntax],
};

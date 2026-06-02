import type {MarkdownExtension} from '../extension';

/**
 * Permits inline `style` and `className` attributes on every element.
 *
 * CAVEAT: the sanitizer does not inspect style *contents*, and inline styles are
 * an authoring smell. This is ported verbatim from legacy SafeMarkdown, which
 * carried the same "gross, TODO: replace with semantic content" note. Prefer
 * semantic markup; enable this only where existing curriculum depends on it.
 */
export const inlineStyles: MarkdownExtension = {
  name: 'inlineStyles',
  sanitizeSchema: {attributes: {'*': ['style', 'className']}},
};

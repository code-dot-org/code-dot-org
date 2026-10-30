import type {Element, Root} from 'hast';
import visit from 'unist-util-visit';

/**
 * A rehype plugin that marks every paragraph in rendered markdown with
 * `data-notranslate="true"`, so the on-page translation engine leaves it
 * alone.
 *
 * This is the counterpart to localizeMarkdownParagraphs: that plugin both
 * translates each <p> and tags the result `data-notranslate`. When
 * SafeMarkdown is rendered with localized={false} we deliberately skip the
 * translation step, but we still want the resulting <p> tags to be left
 * untouched by the on-page translator, so we tag them here without performing
 * any translation ourselves.
 *
 * See SafeMarkdown.jsx for how it is wired into the markdown pipeline.
 */
const notranslateMarkdownParagraphs =
  () =>
  (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'p') {
        return;
      }

      node.properties = {
        // data-notranslate prevents the rendered DOM from being translated.
        dataNotranslate: 'true',
        ...(node.properties || {}),
      };
    });
  };

export default notranslateMarkdownParagraphs;

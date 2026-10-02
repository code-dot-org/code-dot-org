import type {Element, Root} from 'hast';
import visit from 'unist-util-visit';

/**
 * A rehype plugin that prepares rendered markdown for the on-page translator.
 *
 * Each <p> is marked `data-isolate` so the translator takes the paragraph as
 * one string, and each embedded Blockly <xml> is marked `data-ignore` so its
 * block markup is left out of that string. The workspace SVG that later
 * replaces an <xml> on the page is marked by convertXmlToBlockly.
 *
 * See SafeMarkdown.jsx for how it is wired into the markdown pipeline.
 */
const localizeMarkdownParagraphs =
  () =>
  (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'p') {
        node.properties = {
          dataIsolate: 'true',
          ...(node.properties || {}),
        };
      } else if (node.tagName === 'xml') {
        node.properties = {
          dataIgnore: 'true',
          ...(node.properties || {}),
        };
        return visit.SKIP;
      }
    });
  };

export default localizeMarkdownParagraphs;

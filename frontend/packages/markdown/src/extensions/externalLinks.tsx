import type {Element, Nodes, Root} from 'hast';

import type {MarkdownExtension} from '../extension';

export interface ExternalLinksOptions {
  /**
   * Decide which links open in a new tab, by href. Defaults to every link.
   */
  isExternal?: (href: string) => boolean;
}

const markNewTab = (node: Element): void => {
  node.properties = {...node.properties, target: '_blank'};
};

const externalLinksPlugin =
  (isExternal?: (href: string) => boolean) => () => (tree: Root) => {
    const walk = (node: Nodes): void => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href =
          typeof node.properties?.href === 'string' ? node.properties.href : '';
        if (!isExternal || isExternal(href)) {
          markNewTab(node);
        }
      }
      if ('children' in node) {
        node.children.forEach(child => walk(child));
      }
    };
    walk(tree);
  };

/**
 * Opens links in a new tab.
 *
 * Sets `target="_blank"` on matching links; the base link component maps that to
 * the design-system Link's `openInNewTab`, which also applies
 * `rel="noopener noreferrer"`. By default every link opens in a new tab —
 * matching legacy SafeMarkdown's `openExternalLinksInNewTab` (which used
 * `links: 'all'`). Pass `isExternal` to scope it, e.g. to off-site links only.
 *
 * This needs no component of its own: it annotates the link nodes and widens the
 * allowlist so `target` survives sanitization.
 */
export const externalLinks = (
  options: ExternalLinksOptions = {},
): MarkdownExtension => ({
  name: 'externalLinks',
  rehypePlugins: [externalLinksPlugin(options.isExternal)],
  sanitizeSchema: {attributes: {a: ['target']}},
});

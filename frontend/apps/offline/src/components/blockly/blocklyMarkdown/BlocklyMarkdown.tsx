import React from 'react';

import Blockly, {BlockDefinition} from '../../blockly';
import Markdown from '../../markdown';

export interface BlocklyMarkdownProps extends MarkdownProps {
  customBlocks?: BlockDefinition[];
}

// This takes the XML nodes from the markdown renderer and creates a DOM tree.
// It will return a unique string built from that tree to use as a unique key.
const xmlRenderer: (
  parent: HTMLElement,
  node: MarkdownToJS.HTMLNode,
) => string = (parent, node) => {
  let ret = '';

  if (!node?.tag) {
    parent.appendChild(node);
    return node;
  }

  const element = document.createElement(node.tag);
  ret += node.tag;

  parent.appendChild(element);

  for (const [key, value] of Object.entries(node.attrs || {})) {
    element.setAttribute(key, value);
  }

  for (const child of node.children || []) {
    ret += xmlRenderer(element, child);
  }

  return ret;
};

/**
 * This is a version of a markdown renderer that will recognize `<xml>` sequences as
 * Blockly embedded workspaces.
 *
 * This is useful for rendering instructions or documentation with embedded blocks.
 */
const BlocklyMarkdown: React.FunctionComponent<BlocklyMarkdownProps> = ({
  customBlocks,
  renderer,
  theme,
  ...props
}) => (
  <Markdown
    {...props}
    options={{
      renderRule(next, node) {
        if (node?.tag === 'xml') {
          // Render the <xml> into a DOM tree and pass it to a Blockly instance
          const fragment = document.createDocumentFragment();
          const root = document.createElement('body');
          fragment.appendChild(root);
          const key = xmlRenderer(root, node);
          return (
            <Blockly
              customBlocks={customBlocks}
              renderer={renderer}
              theme={theme}
              key={key}
              inline
              startBlocks={root.innerHTML}
            />
          );
        }

        // Just render the default and continue
        return next();
      },
    }}
  />
);

export default BlocklyMarkdown;

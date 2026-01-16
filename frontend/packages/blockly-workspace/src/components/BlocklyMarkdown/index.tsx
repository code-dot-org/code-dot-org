import type {MarkdownToJSX} from 'markdown-to-jsx';
import {RuleType} from 'markdown-to-jsx';

import {BodyTwoText} from '@code-dot-org/component-library/typography';
import Markdown, {MarkdownProps} from '@code-dot-org/markdown';

import type {Plugin} from '../../plugins';
import type {Theme, Renderer, BlockDefinition} from '../../types';
import {convertBlocklyXmlToJson} from '../../xml';
import BlocklyWorkspace from '../BlocklyWorkspace';

export interface BlocklyMarkdownProps extends MarkdownProps {
  blocks?: BlockDefinition[];
  renderer?: Renderer;
  plugins?: Plugin[];
  theme?: Theme;
}

// This takes the XML nodes from the markdown renderer and creates a DOM tree.
// It will return a unique string built from that tree to use as a unique key.
const xmlRenderer: (
  parent: HTMLElement,
  node: MarkdownToJSX.ParserResult,
) => string = (parent, node) => {
  let ret = '';

  if (node.type === RuleType.text) {
    const text: string = node.text;
    const element = document.createTextNode(text);
    parent.appendChild(element);
    return text;
  }

  if (
    node.type === RuleType.htmlBlock ||
    node.type === RuleType.htmlSelfClosing
  ) {
    const element = document.createElement(node.tag);
    ret += node.tag;
    parent.appendChild(element);

    for (const [key, value] of Object.entries(node.attrs || {})) {
      element.setAttribute(key, value);
    }

    if (node.type === RuleType.htmlBlock) {
      for (const child of node.children || []) {
        ret += xmlRenderer(element, child);
      }
    }
  }

  return ret;
};

/**
 * This is a version of a markdown renderer that will recognize `<xml>` sequences as
 * Blockly embedded workspaces.
 *
 * This is useful for rendering instructions or documentation with embedded blocks.
 */
const BlocklyMarkdown = ({
  blocks,
  renderer,
  plugins,
  theme,
  ...props
}: BlocklyMarkdownProps) => (
  <Markdown
    {...props}
    options={{
      overrides: {
        p: {
          component: BodyTwoText,
          props: {
            style: {
              display: 'block',
              margin: 0,
            },
          },
        },
      },
      renderRule(next, node) {
        if (
          node.type === RuleType.htmlBlock ||
          node.type === RuleType.htmlSelfClosing
        ) {
          if (node.tag === 'xml') {
            // Render the <xml> into a DOM tree and pass it to a Blockly instance
            const fragment = document.createDocumentFragment();
            const root = document.createElement('body');
            fragment.appendChild(root);
            const key = xmlRenderer(root, node);
            return (
              <BlocklyWorkspace
                blocks={blocks}
                renderer={renderer}
                plugins={plugins}
                theme={theme}
                key={key}
                inline
                startBlocks={convertBlocklyXmlToJson(
                  new DOMParser(),
                  root.innerHTML,
                )}
              />
            );
          }
        }

        // Just render the default and continue
        return next();
      },
    }}
  />
);

export default BlocklyMarkdown;

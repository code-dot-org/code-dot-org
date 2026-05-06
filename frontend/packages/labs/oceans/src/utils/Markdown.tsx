/**
 * Implementation of this Markdown component is based off of the implementation
 * of SafeMarkdown in the main code-dot-org repo.
 */
import type {ReactNode} from 'react';
import * as React from 'react';
import rehypeReact from 'rehype-react';
import remarkRehype from 'remark-rehype';

import Parser from '@code-dot-org/redactable-markdown';

const markdownProcessor = Parser.create()
  .getParser()
  .use(remarkRehype)
  .use(rehypeReact, {createElement: React.createElement});

interface MarkdownProps {
  /** Markdown string to render as sanitized HTML. */
  markdown: string;
}

export default class Markdown extends React.Component<MarkdownProps> {
  render(): ReactNode {
    return markdownProcessor.processSync(this.props.markdown)
      .contents as ReactNode;
  }
}

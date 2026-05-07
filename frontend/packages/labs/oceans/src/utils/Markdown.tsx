/**
 * Implementation of this Markdown component is based off of the implementation
 * of SafeMarkdown in the main code-dot-org repo.
 *
 */
import * as React from 'react';
import rehypeReact from 'rehype-react';
import remarkRehype from 'remark-rehype';

import Parser from '@code-dot-org/redactable-markdown';

const markdownProcessor = Parser.create()
  .getParser()
  .use(remarkRehype)
  .use(rehypeReact, {createElement: React.createElement});

interface MarkdownProps {
  markdown: string;
}

export default class Markdown extends React.Component<MarkdownProps> {
  render() {
    return markdownProcessor.processSync(this.props.markdown)
      .contents as React.ReactNode;
  }
}

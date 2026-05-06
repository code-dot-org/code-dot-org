/**
 * Implementation of this Markdown component is based off of the implementation
 * of SafeMarkdown in the main code-dot-org repo.
 *
 */
import * as PropTypes from 'prop-types';
import * as React from 'react';
import rehypeReact from 'rehype-react';
import remarkRehype from 'remark-rehype';

import Parser from '@code-dot-org/redactable-markdown';

const markdownProcessor = Parser.create()
  .getParser()
  .use(remarkRehype)
  .use(rehypeReact, {createElement: React.createElement});

export default class Markdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
  };

  render() {
    return markdownProcessor.processSync(this.props.markdown).contents;
  }
}

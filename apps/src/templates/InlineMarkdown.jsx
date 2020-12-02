import PropTypes from 'prop-types';
import React from 'react';

import rehypeReact from 'rehype-react';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import unified from 'unified';

function inlineOnly() {
  // remove ability to parse all block methods except paragraphs; some inner
  // functionality of remark depends on paragraphs being present, and we'll
  // just strip them out at the end.
  this.Parser.prototype.blockMethods = ['paragraph'];
}

const markdownToReact = unified()
  .use(remarkParse)
  .use(inlineOnly)
  .use(remarkRehype)
  .use(rehypeReact, {
    createElement: React.createElement
  });

export default class InlineMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired
  };

  render() {
    const rendered = markdownToReact.processSync(this.props.markdown).contents;
    // rendered will be a paragraph element because we kept the 'paragraph'
    // block method enabled in the parser above for structural reasons; we want
    // to simply swap that out for a span element.
    return <span>{rendered.props.children}</span>;
  }
}

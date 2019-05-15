import PropTypes from 'prop-types';
import React from 'react';

import Parser from '@code-dot-org/redactable-markdown';

import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeReact from 'rehype-react';
import defaultSanitizationSchema from 'hast-util-sanitize/lib/github.json';

import expandableImages from './plugins/expandableImages';
import xmlAsTopLevelBlock from './plugins/xmlAsTopLevelBlock';
import externalLinks from './plugins/externalLinks';

// create custom sanitization schema as per
// https://github.com/syntax-tree/hast-util-sanitize#schema
// to support our custom syntaxes
const schema = Object.assign({}, defaultSanitizationSchema);

// We use a _lot_ of image formatting stuff in our
// instructions, particularly in CSP
schema.attributes.img.push('height', 'width');

// Add support for expandableImages
schema.tagNames.push('span');
schema.attributes.span = ['dataUrl', 'className'];

// Add support for inline styles (gross)
// TODO replace all inline styles in our curriculum content with
// semantically-significant content
schema.attributes['*'].push('style', 'className');

// Add support for Blockly XML
schema.clobber = [];
schema.tagNames.push(
  'block',
  'functional_input',
  'mutation',
  'next',
  'statement',
  'title',
  'value',
  'xml'
);

const markdownToReact = Parser.create()
  .getParser()
  // include custom plugins
  .use([xmlAsTopLevelBlock, expandableImages])
  // convert markdown to an HTML Abstract Syntax Tree (HAST)
  .use(remarkRehype, {
    // include any raw HTML in the markdown as raw HTML nodes in the HAST
    allowDangerousHTML: true
  })
  // parse the raw HTML nodes in the HAST to actual HAST nodes
  .use(rehypeRaw)
  // sanitize the HAST
  .use(rehypeSanitize, schema)
  // convert the HAST to React
  .use(rehypeReact, {
    createElement: React.createElement
  });

const markdownToReactExternalLinks = markdownToReact().use(externalLinks, {
  links: 'all'
});

/**
 * Basic component for rendering a markdown string as HTML, with sanitization
 */
export default class UnsafeRenderedMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    openExternalLinksInNewTab: PropTypes.bool
  };

  render() {
    const parser = this.props.openExternalLinksInNewTab
      ? markdownToReactExternalLinks
      : markdownToReact;

    const rendered = parser.processSync(this.props.markdown).contents;

    // rehype-react will only wrap the compiled markdown in a <div> tag
    // if it needs to (ie, if there would otherwise be multiple elements
    // returned). We prefer consistency over flexibility, so here we wrap
    // the result in a div if it wasn't already
    if (rendered && rendered.type === 'div') {
      return rendered;
    } else {
      return <div>{rendered}</div>;
    }
  }
}

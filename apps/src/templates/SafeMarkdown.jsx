import PropTypes from 'prop-types';
import React from 'react';

import Parser from '@code-dot-org/redactable-markdown';

import {
  details,
  expandableImages,
  visualCodeBlock,
  xmlAsTopLevelBlock
} from '@code-dot-org/remark-plugins';

import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeReact from 'rehype-react';
import defaultSanitizationSchema from 'hast-util-sanitize/lib/github.json';

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
const blocklyTags = [
  'block',
  'functional_input',
  'mutation',
  'next',
  'statement',
  'title',
  'value',
  'xml'
];
schema.tagNames = schema.tagNames.concat(blocklyTags);
blocklyTags.forEach(tag => {
  schema.attributes[tag] = ['block_text', 'id', 'inline', 'name', 'type'];
});

const markdownToReact = Parser.create()
  .getParser()
  // include custom plugins
  .use([expandableImages, visualCodeBlock, xmlAsTopLevelBlock, details])
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
 * Basic component for rendering a markdown string as HTML, with sanitization.
 * Can safely render markdown even from untrusted sources, without potentially
 * exposing us to an XSS injection.
 */
export default class SafeMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    openExternalLinksInNewTab: PropTypes.bool
  };

  render() {
    // We only open external links in a new tab if it's explicitly specified
    // that we do so; this is absolutely not something we want to do as a
    // general practice, but unfortunately there are some situations in which
    // it is currently a requirement.
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

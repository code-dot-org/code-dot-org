import Processor from '@code-dot-org/redactable-markdown';
import {
  details,
  clickableText,
  expandableImages,
  visualCodeBlock,
  xmlAsTopLevelBlock,
} from '@code-dot-org/remark-plugins';
import defaultSanitizationSchema from 'hast-util-sanitize/lib/github.json';
import PropTypes from 'prop-types';
import React from 'react';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import rehypeSanitize from 'rehype-sanitize';
import remarkRehype from 'remark-rehype';
import unified from 'unified';

import externalLinks from './plugins/externalLinks';

/**
 * Basic component for rendering a markdown string as HTML, with sanitization.
 * Can safely render markdown even from untrusted sources, without potentially
 * exposing us to an XSS injection.
 */
class SafeMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    openExternalLinksInNewTab: PropTypes.bool,
    className: PropTypes.string,
  };

  render() {
    // We only open external links in a new tab if it's explicitly specified
    // that we do so; this is absolutely not something we want to do as a
    // general practice, but unfortunately there are some situations in which
    // it is currently a requirement.
    const processor = this.props.openExternalLinksInNewTab
      ? markdownToReactExternalLinks
      : markdownToReact;

    const rendered = processor.processSync(this.props.markdown).result;

    const markdownProps = {};
    if (this.props.className) {
      markdownProps.className = this.props.className;
    }
    // rehype-react will only wrap the compiled markdown in a <div> tag
    // if it needs to (ie, if there would otherwise be multiple elements
    // returned) or we're assigning props. We prefer consistency over flexibility,
    // so here we wrap the result in a div if it wasn't already
    if (
      rendered &&
      rendered.type === 'div' &&
      !Object.keys(markdownProps).length
    ) {
      return rendered;
    } else {
      return <div {...markdownProps}>{rendered}</div>;
    }
  }
}

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

// ClickableText uses data-id on a bold tag.
schema.attributes['b'] = ['dataId'];

// Add support for Blockly XML
schema.clobber = [];
const blocklyTags = [
  'block',
  'functional_input',
  'mutation',
  'next',
  'statement',
  'title',
  'field',
  'value',
  'xml',
];
schema.tagNames = schema.tagNames.concat(blocklyTags);
let blocklyComponentWrappers = {};
blocklyTags.forEach(tag => {
  schema.attributes[tag] = ['block_text', 'id', 'inline', 'name', 'type'];

  // Create a React component to wrap each Blockly tag. Since these elements ultimately
  // render as React components, creating a wrapper makes them valid (whereas <xml>
  // is not a valid React tag).
  blocklyComponentWrappers[tag] = function (props) {
    const BlocklyElement = tag;
    // The "is" attribute prevents React from warning about unrecognized tags:
    // https://github.com/facebook/react/issues/11184#issuecomment-335942439
    return <BlocklyElement is={tag} {...props} />;
  };
});
const markdownToReact = unified()
  .use(Processor.getParser())
  // include custom plugins
  .use([
    clickableText,
    expandableImages,
    visualCodeBlock,
    xmlAsTopLevelBlock,
    details,
  ])
  // convert markdown to an HTML Abstract Syntax Tree (HAST)
  .use(remarkRehype, {
    // include any raw HTML in the markdown as raw HTML nodes in the HAST
    allowDangerousHtml: true,
  })
  // parse the raw HTML nodes in the HAST to actual HAST nodes
  .use(rehypeRaw)
  // sanitize the HAST
  .use(rehypeSanitize, schema)
  // convert the HAST to React
  .use(rehypeReact, {
    createElement: React.createElement,
    // Use React component wrappers for Blockly XML elements to prevent
    // React from warning us about invalid components.
    components: blocklyComponentWrappers,
  });

const markdownToReactExternalLinks = markdownToReact().use(externalLinks, {
  links: 'all',
});

export default SafeMarkdown;

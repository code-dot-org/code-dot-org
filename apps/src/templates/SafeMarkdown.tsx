import RedactableMarkdownProcessor from '@code-dot-org/redactable-markdown';
import {
  details,
  clickableText,
  expandableImages,
  visualCodeBlock,
  xmlAsTopLevelBlock,
} from '@code-dot-org/remark-plugins';
import {Schema} from 'hast-util-sanitize';
import defaultSanitizationSchema from 'hast-util-sanitize/lib/github.json';
import React, {ComponentType, HTMLAttributes} from 'react';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import rehypeSanitize from 'rehype-sanitize';
import remarkRehype from 'remark-rehype';
import unified, {Processor} from 'unified';

import externalLinks from './plugins/externalLinks';

type RehypeComponentsMap = {
  [tagName: string]: ComponentType;
};

interface SafeMarkdownProps {
  markdown: string;
  openExternalLinksInNewTab?: boolean;
  unwrapped?: boolean;
  className?: string;
  id?: string;
  rehypeMap?: RehypeComponentsMap;
}

/**
 * Basic component for rendering a markdown string as HTML, with sanitization.
 * Can safely render markdown even from untrusted sources, without potentially
 * exposing us to an XSS injection.
 */

export const SafeMarkdown: React.FunctionComponent<
  SafeMarkdownProps
> = props => {
  // We only open external links in a new tab if it's explicitly specified
  // that we do so; this is absolutely not something we want to do as a
  // general practice, but unfortunately there are some situations in which
  // it is currently a requirement.
  const processor = props.openExternalLinksInNewTab
    ? markdownToReactExternalLinks(props)
    : markdownToReact(props);

  const rendered = Object(processor.processSync(props.markdown).result);

  const markdownProps: HTMLAttributes<HTMLDivElement> = {};
  if (props.className) {
    markdownProps.className = props.className;
  }
  if (props.id) {
    markdownProps.id = props.id;
  }

  if (props.unwrapped) {
    return rendered.props.children;
  }
  // rehype-react will only wrap the compiled markdown in a <div> tag
  // if it needs to (ie, if there would otherwise be multiple elements
  // returned) or we're assigning props. We prefer consistency over flexibility,
  // so here we wrap the result in a div if it wasn't already
  else if (
    rendered &&
    rendered.type === 'div' &&
    !Object.keys(markdownProps).length
  ) {
    return rendered;
  } else {
    return <div {...markdownProps}>{rendered}</div>;
  }
};

type DefaultGithubSanitizationSchema = typeof defaultSanitizationSchema;
type CustomSanitationSchema = DefaultGithubSanitizationSchema & {
  attributes: {
    [key: string]: (string | boolean)[] | (string | boolean)[][];
  };
};
// create custom sanitization schema as per
// https://github.com/syntax-tree/hast-util-sanitize#schema
// to support our custom syntaxes
const schema: CustomSanitationSchema = {...defaultSanitizationSchema};

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
const blocklyComponentWrappers: {
  [key: string]: (
    attributes: HTMLAttributes<HTMLUnknownElement>
  ) => JSX.Element;
} = {};

blocklyTags.forEach(tag => {
  schema.attributes[tag] = ['block_text', 'id', 'inline', 'name', 'type'];

  // Create a JSX element to wrap each Blockly tag. Creating a wrapper makes
  // them valid (whereas <xml> is not a valid JSX element).
  blocklyComponentWrappers[tag] = function (
    attributes: HTMLAttributes<HTMLUnknownElement>
  ) {
    const BlocklyElement = tag;
    // The "is" attribute prevents React from warning about unrecognized tags:
    // https://github.com/facebook/react/issues/11184#issuecomment-335942439
    return <BlocklyElement is={tag} {...attributes} />;
  };
});

// These wrappers add context for Localize to better understand the markdown
// output. This also will enable URL localization for all links.
const localizationComponentWrappers = {
  a: function (attributes: HTMLAttributes<HTMLAnchorElement>) {
    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a {...attributes} data-lz-url="true" data-localize="markdown-url" />
    );
  },
  p: function (attributes: HTMLAttributes<HTMLParagraphElement>) {
    return <p {...attributes} data-isolate="true" />;
  },
};

const markdownToReact = (props: SafeMarkdownProps) => {
  const processor: Processor = unified()
    .use(RedactableMarkdownProcessor.getParser())
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
    .use(rehypeSanitize, schema as Schema)
    // convert the HAST to React
    .use(rehypeReact, {
      createElement: React.createElement,
      // Use React component wrappers for Blockly XML elements to prevent
      // React from warning us about invalid components.
      components: {
        ...blocklyComponentWrappers,
        ...localizationComponentWrappers,
        ...props.rehypeMap,
      },
    });
  return processor;
};

const markdownToReactExternalLinks = (props: SafeMarkdownProps) =>
  markdownToReact(props).use(externalLinks, {
    links: 'all',
  });

export default SafeMarkdown;

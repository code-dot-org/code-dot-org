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

import {WeakMapPlus} from '../util/dataStructures/WeakMapPlus';

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
    unwrapped: PropTypes.bool,
    className: PropTypes.string,
    id: PropTypes.string,
    /*
     * A rehype component map used to map between tagNames and react components you wish to
     * swap for elements with that tagName.
     * see: https://github.com/marekweb/rehype-components/blob/main/readme.md#rehype-components
     *
     * Note: It is the consumer's responsibility to define a reusable rehypeMap whenever the
     * component will be rendered multiple times. See `markdownProcessorCache` below.
     *
     * Note: If we upgrade to prop-types >= 15.7.0 we should use `PropTypes.elementType`
     * which looks for a react component function or class rather than any function/class.
     * https://github.com/facebook/prop-types/blob/main/CHANGELOG.md#1570
     **/
    rehypeMap: PropTypes.objectOf(PropTypes.func),
    /*
     * Allow <iframe> embeds in the rendered markdown. Only set this for
     * curriculum content targeted at non-student audiences (professional
     * learning, facilitator-facing courses). Never enable for student-facing
     * levels — the server gates this via participant_audience.
     */
    allowEmbeds: PropTypes.bool,
  };

  render() {
    // We only open external links in a new tab if it's explicitly specified
    // that we do so; this is absolutely not something we want to do as a
    // general practice, but unfortunately there are some situations in which
    // it is currently a requirement.
    let getProcessor;
    if (this.props.allowEmbeds && this.props.openExternalLinksInNewTab) {
      getProcessor = markdownToReactWithEmbedsAndExternalLinks;
    } else if (this.props.allowEmbeds) {
      getProcessor = markdownToReactWithEmbeds;
    } else if (this.props.openExternalLinksInNewTab) {
      getProcessor = markdownToReactExternalLinks;
    } else {
      getProcessor = markdownToReact;
    }
    const processor = getProcessor(this.props.rehypeMap);

    const rendered = Object(processor.processSync(this.props.markdown).result);

    const markdownProps = {};
    if (this.props.className) {
      markdownProps.className = this.props.className;
    }
    if (this.props.id) {
      markdownProps.id = this.props.id;
    }

    if (this.props.unwrapped) {
      return rendered.props.children ?? null;
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

// These wrappers add context for Localize to better understand the markdown
// output. This also will enable URL localization for all links.
const localizationComponentWrappers = {
  a: function (props) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a {...props} data-lz-url="true" data-localize="markdown-url" />;
  },
  p: function (props) {
    return <p {...props} data-isolate="true" />;
  },
};

// Extends the base schema to allow <iframe> embeds for professional learning
// content. Only used when allowEmbeds=true, which the server gates on
// participant_audience !== 'student'.
const schemaWithEmbeds = {
  ...schema,
  tagNames: [...schema.tagNames, 'iframe'],
  attributes: {
    ...schema.attributes,
    iframe: [
      'src',
      'width',
      'height',
      'frameBorder',
      'allowFullScreen',
      'allow',
      'title',
    ],
  },
};

/*
 * Map to cache markdown processors based on the rehypeMap as key. Use `WeakMapPlus` as normal
 * WeakMap does not support `undefined` as a key.
 **/
const markdownProcessorCache = new WeakMapPlus();

const buildMarkdownProcessor = (rehypeMap, processorSchema) =>
  unified()
    .use(Processor.getParser())
    .use([
      clickableText,
      expandableImages,
      visualCodeBlock,
      xmlAsTopLevelBlock,
      details,
    ])
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(rehypeSanitize, processorSchema)
    .use(rehypeReact, {
      createElement: React.createElement,
      components: {
        ...blocklyComponentWrappers,
        ...localizationComponentWrappers,
        ...rehypeMap,
      },
    });

/*
 * Create a markdown to react processor cached based on the value of rehypeMap. This ensures
 * multiple `SafeMarkdown` components and instances will reuse the same processor when the
 * rehypeMap is the same. Caching is based on the identity of the `rehypeMap` object not the
 * contents within it (e.g. two different rehypeMap objects with the same tagName/reactComponent
 * mapping will result in two different processors). It is the consumer's responsibility to
 * create the rehypeMap outside of the component function (or render method in class based
 * components) or to define the mapping in an ES module and import it if used in multiple
 * components.
 */
const markdownToReact = rehypeMap => {
  if (!markdownProcessorCache.has(rehypeMap)) {
    markdownProcessorCache.set(
      rehypeMap,
      buildMarkdownProcessor(rehypeMap, schema)
    );
  }
  return markdownProcessorCache.get(rehypeMap);
};

/* Cache for processors that allow iframe embeds (non-student PL content). */
const markdownProcessorWithEmbedsCache = new WeakMapPlus();

const markdownToReactWithEmbeds = rehypeMap => {
  if (!markdownProcessorWithEmbedsCache.has(rehypeMap)) {
    markdownProcessorWithEmbedsCache.set(
      rehypeMap,
      buildMarkdownProcessor(rehypeMap, schemaWithEmbeds)
    );
  }
  return markdownProcessorWithEmbedsCache.get(rehypeMap);
};

/* Map to cache markdown to react processors w/ externalLinks plugin. */
const markdownProcessorExternalLinksCache = new WeakMapPlus();

/*
 * Create a markdown to react processor that adds the externalLinks plugin
 * and that is cached based on the value of rehypeMap.
 */
const markdownToReactExternalLinks = rehypeMap => {
  if (!markdownProcessorExternalLinksCache.has(rehypeMap)) {
    // We use `()` to get a new unfrozen "copy" of the processor created
    // (or returned from cache) by `markdownToReact(rehypeMap)`.
    // See: https://github.com/unifiedjs/unified?tab=readme-ov-file#processor
    const processor = markdownToReact(rehypeMap)().use(externalLinks, {
      links: 'all',
    });
    markdownProcessorExternalLinksCache.set(rehypeMap, processor);
  }
  return markdownProcessorExternalLinksCache.get(rehypeMap);
};

/* Map to cache processors with both iframe embeds and external-links-in-new-tab. */
const markdownProcessorWithEmbedsAndExternalLinksCache = new WeakMapPlus();

const markdownToReactWithEmbedsAndExternalLinks = rehypeMap => {
  if (!markdownProcessorWithEmbedsAndExternalLinksCache.has(rehypeMap)) {
    const processor = markdownToReactWithEmbeds(rehypeMap)().use(
      externalLinks,
      {
        links: 'all',
      }
    );
    markdownProcessorWithEmbedsAndExternalLinksCache.set(rehypeMap, processor);
  }
  return markdownProcessorWithEmbedsAndExternalLinksCache.get(rehypeMap);
};

export default SafeMarkdown;

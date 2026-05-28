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
import ReactDOMServer from 'react-dom/server';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import rehypeSanitize from 'rehype-sanitize';
import remarkRehype from 'remark-rehype';
import unified from 'unified';

import localization, {useLocalization} from '@cdo/apps/localization';

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
const makeBlocklyWrapper = tag => {
  // Wrap the raw blockly tag (xml, block, ...) in a React function component
  // so it can sit in a React tree — <xml> etc. are not valid React tags. The
  // "is" attribute suppresses React's unknown-tag warning:
  // https://github.com/facebook/react/issues/11184#issuecomment-335942439
  const wrapper = function (props) {
    const BlocklyElement = tag;
    return <BlocklyElement is={tag} {...props} />;
  };
  wrapper.displayName = `Blockly_${tag}`;
  return wrapper;
};

let blocklyComponentWrappers = {};
blocklyTags.forEach(tag => {
  schema.attributes[tag] = ['block_text', 'id', 'inline', 'name', 'type'];
  blocklyComponentWrappers[tag] = makeBlocklyWrapper(tag);
});

// Identify the <xml> blockly wrapper by reference, not by invoking it. This
// avoids depending on the wrapper's runtime behavior and survives wrapping
// it in memo/forwardRef/etc.
const isXmlBlock = child => child?.type === blocklyComponentWrappers.xml;

// Parse an inline CSS declaration string (e.g. "color: red; padding: 4px")
// into the object form React requires for the `style` prop. Kebab-cased
// property names are camelCased; vendor prefixes like `-webkit-transform`
// land as `WebkitTransform` because the leading dash matches the first
// kebab segment.
//
// We really only need this for the visualCodeBlock <code> elements. Those
// are just a simple `background-color: xxx`, so this is sufficient for
// those. But this implementation will cover anything that has one or
// more simple rules.
const parseInlineStyle = styleString => {
  const obj = {};
  styleString.split(';').forEach(decl => {
    const colon = decl.indexOf(':');
    if (colon < 0) return;
    const key = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!key) return;
    obj[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  });
  return obj;
};

/**
 * Convert a translated DOM node back to a React element tree. Placeholder
 * spans (those carrying a `data-token` attribute) are swapped for the
 * original untranslated React element they stand in for; everything else is
 * recreated structurally so the translated text nodes land in the right place.
 */
const domToReact = (node, key, placeholders) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  if (node.hasAttribute('data-token')) {
    const idx = Number(node.getAttribute('data-token'));
    return React.cloneElement(placeholders[idx], {key: `xml-${idx}`});
  }

  const isCode = node.hasAttribute('data-code-element');
  if (isCode) {
    node.removeAttribute('data-code-element');
  }

  const props = {key};
  for (const attr of node.attributes) {
    if (attr.name === 'class') {
      props.className = attr.value;
    } else if (attr.name === 'style') {
      props.style = parseInlineStyle(attr.value);
    } else {
      props[attr.name] = attr.value;
    }
  }

  const children = [];
  node.childNodes.forEach((child, i) => {
    const result = domToReact(child, i, placeholders);
    if (result !== null) {
      children.push(result);
    }
  });

  return React.createElement(
    isCode ? 'code' : node.tagName.toLowerCase(),
    props,
    ...children
  );
};

/**
 * Localizes a 'complex' paragraph: one containing one or more <xml> blocks
 * that our translation engine would otherwise refuse to touch. The approach:
 *
 *   1. Build a detached <p> DOM tree from the React children. Strings become
 *      text nodes, simple inline elements (<b>, <a>, <code>, ...) become real
 *      DOM so the translator can reason about their content, and each <xml>
 *      block is replaced by an empty `<span data-token="i">`
 *      placeholder while the original React element is stashed by index.
 *
 *   2. Hand the <p> to localization.translate, which returns an equivalent DOM
 *      tree with the text nodes translated.
 *
 *   3. Walk the translated DOM and rebuild a React tree, swapping each
 *      placeholder span back for its stashed XML element. The outer <p>
 *      inherits the original element's props plus `data-notranslate` so the
 *      translator doesn't try to re-translate the already-translated output.
 */
const LocalizedParagraph = ({p}) => {
  useLocalization();

  const childArray = React.Children.toArray(p.props.children);
  const placeholders = [];

  const container = document.createElement('p');
  container.setAttribute('data-isolate', 'true');
  childArray.forEach(item => {
    if (typeof item === 'string' || typeof item === 'number') {
      container.appendChild(document.createTextNode(String(item)));
    } else if (isXmlBlock(item)) {
      const span = document.createElement('span');
      span.setAttribute('data-token', String(placeholders.length));
      placeholders.push(item);
      container.appendChild(span);
    } else {
      const tmp = document.createElement('template');
      tmp.innerHTML = ReactDOMServer.renderToStaticMarkup(item);

      // If this is a <code>...</code> element, replace with a <b>
      // with a data-code-element attribute. Our translation system
      // does not recognize `<code>` blocks.
      const child = tmp.content.children?.[0];
      if (child?.tagName?.toLowerCase() === 'code') {
        const span = document.createElement('b');
        span.innerHTML = child.innerHTML;
        span.setAttribute('data-code-element', 'true');
        container.appendChild(span);
      } else {
        container.appendChild(tmp.content);
      }
    }
  });

  const translated = localization.translate(container, [
    'blockly-instructions',
  ]);

  const root = domToReact(translated, undefined, placeholders);
  const {...truncatedProps} = p.props;
  delete truncatedProps.children;
  return React.cloneElement(root, {
    // Send it all the props but none of the original children
    ...truncatedProps,
    'data-notranslate': 'true',
  });
};

LocalizedParagraph.propTypes = {
  p: PropTypes.element,
};

// These wrappers add context for Localize to better understand the markdown
// output. This also will enable URL localization for all links.
const localizationComponentWrappers = {
  a: function (props) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a {...props} data-lz-url="true" data-localize="markdown-url" />;
  },
  p: function ({children, ...props}) {
    // Wraps the paragraph rendering such that we send it for translation
    // before rendering it to the screen.
    return (
      <LocalizedParagraph
        p={
          // Also ensure that it is not translated. This gets forcibly
          // added to the props list anyway, but we definitely do not
          // want to translate the content here.
          <p data-notranslate="true" {...props}>
            {children}
          </p>
        }
      />
    );
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

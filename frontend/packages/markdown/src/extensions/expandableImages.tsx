import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import {type CSSProperties, type ReactNode} from 'react';

import type {MarkdownExtension} from '../extension';

import {type MdastNode, visit} from './mdast';
import moduleStyles from './expandableImages.module.css';

const EXPANDABLE_SUFFIX = 'expandable';

/*
 * Syntax: an image whose alt text ends with "expandable", e.g.
 * `![A cat expandable](url)`, becomes `<span data-url="url">A cat</span>`.
 * Reuses the markdown image parser, then rewrites the matched image node; the
 * leftover src/alt are dropped by sanitization, which does not allow them on
 * <span>.
 */
const expandableImagesSyntax = () => (tree: MdastNode) => {
  visit(tree, 'image', node => {
    const alt = node.alt ?? '';
    if (node.url && alt.endsWith(EXPANDABLE_SUFFIX)) {
      const text = alt.slice(0, -EXPANDABLE_SUFFIX.length).trim();
      node.data = {
        hName: 'span',
        hProperties: {dataUrl: node.url},
        hChildren: [{type: 'text', value: text}],
      };
    }
  });
};

export interface ExpandableImagesOptions {
  /**
   * Invoked with the image's url and alt text when an expandable image is
   * activated. When omitted, the image renders inline without expand behavior.
   */
  onExpand?: (url: string, alt: string) => void;
}

interface SpanProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  // rehype passes the data attribute through as `data-url`; accept the
  // camelCase form too for safety.
  'data-url'?: string;
  dataUrl?: string;
}

/*
 * `data-url` is a custom attribute, so rehype-sanitize's protocol allowlist —
 * which only inspects known URL attributes like href/src — never vets it. Guard
 * here before the value reaches the <img src> and, more importantly, the
 * onExpand callback (which a consumer may hand to window.open / location): an
 * unsafe scheme there is an XSS / open-redirect sink. Permit only http(s) and
 * scheme-relative references (paths, queries, fragments, `//host` URLs).
 */
const isSafeImageUrl = (url: string): boolean => {
  // Strip ASCII control characters and whitespace first, the way a browser
  // would, so an obscured scheme (e.g. `java\tscript:`) can't slip past.
  // eslint-disable-next-line no-control-regex
  const stripped = url.replace(/[\u0000-\u0020]+/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(stripped);
  return !scheme || /^https?$/i.test(scheme[1]);
};

// Expandable spans carry their alt text as their (text) children.
const textOf = (children: ReactNode): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.filter(child => typeof child === 'string').join('');
  }
  return '';
};

const makeExpandableImage =
  ({onExpand}: ExpandableImagesOptions) =>
  (props: SpanProps) => {
    const {children, className, style} = props;
    const rawUrl = props['data-url'] ?? props.dataUrl;
    // Drop a missing or unsafe url; the element degrades to its plain text.
    const url = rawUrl && isSafeImageUrl(rawUrl) ? rawUrl : undefined;

    // A <span> without a usable data-url is just a span.
    if (!url) {
      return (
        <span className={className} style={style}>
          {children}
        </span>
      );
    }

    const alt = textOf(children);
    const image = <img src={url} alt={alt} className={moduleStyles.image} />;

    // With no handler, show the image but do not make it interactive.
    if (!onExpand) {
      return (
        <span className={className} style={style}>
          {image}
        </span>
      );
    }

    return (
      <button
        type="button"
        className={classNames(moduleStyles.trigger, className)}
        style={style}
        aria-label={alt ? `Expand image: ${alt}` : 'Expand image'}
        onClick={() => onExpand(url, alt)}
      >
        {image}
      </button>
    );
  };

/**
 * Renders expandable images: thumbnails that invoke a handler (typically to
 * open a larger view) when activated.
 *
 * Authors write an image whose alt text ends with "expandable", e.g.
 * `![A cat expandable](url)` (or the equivalent raw
 * `<span data-url="url">A cat</span>`); the syntax transformer rewrites it into
 * a span whose url becomes the image source and whose text becomes the alt.
 * Supply `onExpand` to receive `(url, alt)` on click; without it, the image
 * renders inline and non-interactive. The schema half lets `data-url` survive
 * sanitization and reach the component.
 */
export const expandableImages = (
  options: ExpandableImagesOptions = {},
): MarkdownExtension => ({
  name: 'expandableImages',
  remarkPlugins: [expandableImagesSyntax],
  sanitizeSchema: {attributes: {span: ['dataUrl', 'className']}},
  components: {span: makeExpandableImage(options)} as Partial<Components>,
});

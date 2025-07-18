import classNames from 'classnames';
import ReactMarkdown, {MarkdownToJSX} from 'markdown-to-jsx';
import React from 'react';

import Link from '@code-dot-org/component-library/link';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  BodyTwoText,
  StrongText,
  EmText,
} from '@code-dot-org/component-library/typography';

import moduleStyles from './markdown.module.scss';

export interface MarkdownProps {
  /** Markdown content (used instead of child nodes) */
  content?: string;
  /** Markdown custom className */
  className?: string;
  /** Ensures the markdown renders an inline output */
  inline?: boolean;
  /**
   * Markdown overrides.
   *
   * To specify one, use a key with the name of a tag (h1, span, p, a) or
   * even a custom html element (xml, block, etc) and then specify a
   * component and, optionally, specify properties for that component.
   *
   * Example:
   *
   * overrides={{
   *   a: {
   *     component: Link,
   *     props: {
   *       target: "_blank",
   *     },
   *   },
   * }}
   */
  overrides?: MarkdownToJSX.Overrides;
  /**
   * Other options to the markdown library.
   */
  options?: MarkdownToJSX.Options;
  children?: string;
}

export const reactMarkdownOptions = {
  overrides: {
    h1: {
      component: Heading1,
    },
    h2: {
      component: Heading2,
    },
    h3: {
      component: Heading3,
    },
    h4: {
      component: Heading4,
    },
    p: {
      component: BodyTwoText,
      props: {
        style: {
          display: 'block',
        },
      },
    },
    strong: {
      component: StrongText,
    },
    em: {
      component: EmText,
    },
    a: {
      component: Link,
      props: {
        target: '_blank',
      },
    },
  },
};

/**
 * Represents markdown-flavored rich text content.
 *
 * You use this by placing the markdown as the child content or by passing it to
 * the `content` property. If you use the `content` property, the inner children
 * are ignored.
 */
const Markdown: React.FunctionComponent<MarkdownProps> = ({
  content,
  inline,
  options,
  overrides,
  className,
  children,
}) => (
  <ReactMarkdown
    options={{
      ...options,
      overrides: {
        ...reactMarkdownOptions.overrides,
        ...(options?.overrides || {}),
        ...(overrides || {}),
      },
      forceBlock: !inline,
      forceInline: !!inline,
    }}
    className={classNames(moduleStyles.markdownContainer, className)}
  >
    {content || children || ''}
  </ReactMarkdown>
);

export default Markdown;

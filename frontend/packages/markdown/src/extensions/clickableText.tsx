import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import {type CSSProperties, type KeyboardEvent, type ReactNode} from 'react';

import type {MarkdownExtension} from '../extension';

import {type MdastNode, visit} from './mdast';
import moduleStyles from './clickableText.module.css';

const CLICKABLE_PREFIX = '#clickable=';

/*
 * Syntax: `[label](#clickable=some-id)` becomes `<b data-id="some-id">label</b>`.
 * Reuses the markdown link parser, then rewrites the matched link node so
 * remark-rehype emits a <b> carrying the id (the leftover href is dropped by
 * sanitization, which does not allow href on <b>).
 */
const clickableTextSyntax = () => (tree: MdastNode) => {
  visit(tree, 'link', node => {
    if (node.url?.startsWith(CLICKABLE_PREFIX)) {
      const id = node.url.slice(CLICKABLE_PREFIX.length);
      node.data = {hName: 'b', hProperties: {dataId: id}};
    }
  });
};

export interface ClickableTextOptions {
  /**
   * Invoked with the element's `data-id` when the text is activated by click or
   * keyboard. When omitted, such elements render as ordinary bold text.
   */
  onActivate?: (id: string) => void;
}

interface BoldProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  // rehype passes the data attribute through as `data-id`; accept the camelCase
  // form too for safety.
  'data-id'?: string;
  dataId?: string;
}

const makeClickableText =
  ({onActivate}: ClickableTextOptions) =>
  (props: BoldProps) => {
    const {children, className, style} = props;
    const id = props['data-id'] ?? props.dataId;

    // A <b> without a data-id (or with no handler) is just bold text.
    if (!id || !onActivate) {
      return (
        <b className={className} style={style}>
          {children}
        </b>
      );
    }

    const activate = () => onActivate(id);

    return (
      <b
        role="button"
        tabIndex={0}
        className={classNames(moduleStyles.clickable, className)}
        style={style}
        onClick={activate}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate();
          }
        }}
      >
        {children}
      </b>
    );
  };

/**
 * Renders clickable text: bold text that invokes a handler when activated.
 *
 * Authors write `[label](#clickable=some-id)` (or the equivalent raw
 * `<b data-id="some-id">label</b>`); the syntax transformer rewrites the link
 * into a `<b>` carrying the id. Supply `onActivate` to receive the id on click
 * or keyboard (Enter/Space) activation; without it, such elements render as
 * plain bold text. The schema half lets `data-id` survive sanitization and
 * reach the component.
 */
export const clickableText = (
  options: ClickableTextOptions = {},
): MarkdownExtension => ({
  name: 'clickableText',
  remarkPlugins: [clickableTextSyntax],
  sanitizeSchema: {attributes: {b: ['dataId']}},
  components: {b: makeClickableText(options)} as Partial<Components>,
});

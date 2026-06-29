import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import type {ReactNode} from 'react';

import type {MarkdownExtension} from '../../extension';

import {type MdastNode} from '../mdast';
import moduleStyles from './visualCodeBlock.module.css';

// hast property name (camelCase) carrying the validated hex color.
const COLOR_PROP = 'dataVisualCodeBlock';

// Matches the `(#rrggbb)` that immediately follows the inline code.
const COLOR_RE = /^\(#([0-9a-f]{6})\)/i;

/*
 * Syntax: `displayText`(#rrggbb) becomes a colored code "block".
 *
 * Inline code is already parsed by the markdown parser, so this transformer
 * looks for an inlineCode node immediately followed by text starting with
 * `(#rrggbb)`. It records the (regex-validated) color on the code node and
 * trims the marker from the following text. The color rides as a data
 * attribute rather than an inline style, so it never has to pass through the
 * sanitizer as arbitrary CSS — the component applies it.
 */
const visualCodeBlockSyntax = () => (tree: MdastNode) => {
  const walk = (node: MdastNode) => {
    const children = node.children;
    if (!children) {
      return;
    }
    for (let i = 0; i < children.length; i++) {
      const code = children[i];
      const next = children[i + 1];
      if (code.type === 'inlineCode' && next?.type === 'text' && next.value) {
        const match = COLOR_RE.exec(next.value);
        if (match) {
          code.data = {
            ...code.data,
            hProperties: {
              ...code.data?.hProperties,
              [COLOR_PROP]: `#${match[1]}`,
            },
          };
          next.value = next.value.slice(match[0].length);
        }
      }
      walk(code);
    }
  };
  walk(tree);
};

interface CodeProps {
  children?: ReactNode;
  className?: string;
  'data-visual-code-block'?: string;
}

const VisualCode = (props: CodeProps) => {
  const {children, className} = props;
  const color = props['data-visual-code-block'];

  // Plain inline code (no color marker) renders as ordinary <code>.
  if (!color) {
    return <code className={className}>{children}</code>;
  }

  return (
    <code
      className={classNames(moduleStyles.visualBlock, className)}
      style={{backgroundColor: color}}
    >
      {children}
    </code>
  );
};

/**
 * Renders visual code blocks: inline code with a background color, resembling
 * (but not identical to) the blocks of a visual programming language.
 *
 * Authors write `` `displayText`(#rrggbb) `` — e.g. `` `playSound()`(#fff176) ``.
 * The color is validated as a six-digit hex and applied by the component, so no
 * inline CSS is sanitized. Plain inline code is unaffected.
 */
export const visualCodeBlock: MarkdownExtension = {
  name: 'visualCodeBlock',
  remarkPlugins: [visualCodeBlockSyntax],
  sanitizeSchema: {attributes: {code: [COLOR_PROP]}},
  components: {code: VisualCode} as Partial<Components>,
};

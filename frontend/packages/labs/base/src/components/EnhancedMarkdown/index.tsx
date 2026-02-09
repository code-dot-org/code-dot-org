import {RuleType} from 'markdown-to-jsx';
import type {FunctionComponent} from 'react';

import Link from '@code-dot-org/component-library/link';
import {Markdown, type MarkdownProps} from '@code-dot-org/platform';

export interface EnhancedMarkdownProps extends MarkdownProps {
  onInstructionsTextClick?: (id: string) => void;
}

const EnhancedMarkdown: FunctionComponent<EnhancedMarkdownProps> = ({
  onInstructionsTextClick,
  ...props
}) => (
  <Markdown
    {...props}
    options={{
      ...props.options,
      renderRule(next, node, renderChildren, state) {
        if (
          node.type === RuleType.link &&
          node.target.startsWith('#clickable=')
        ) {
          const id = node.target.split('=')[1] || 'unknown';
          return (
            <Link
              onClick={() => onInstructionsTextClick?.(id)}
              children={renderChildren(node.children, state)}
            />
          );
        }

        // Just render the default and continue
        return next();
      },
    }}
  />
);

export default EnhancedMarkdown;

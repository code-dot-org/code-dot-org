import {useMemo} from 'react';

import {Markdown, extensions, type MarkdownProps} from '@code-dot-org/markdown';

export interface EnhancedMarkdownProps extends MarkdownProps {
  onInstructionsTextClick?: (id: string) => void;
}

const EnhancedMarkdown = ({
  onInstructionsTextClick,
  extensions: extraExtensions,
  ...props
}: EnhancedMarkdownProps) => {
  const markdownExtensions = useMemo(
    () => [
      extensions.clickableText({
        onActivate: onInstructionsTextClick,
      }),
      ...(extraExtensions ?? []),
    ],
    [onInstructionsTextClick, extraExtensions],
  );

  return <Markdown {...props} extensions={markdownExtensions} />;
};

export default EnhancedMarkdown;

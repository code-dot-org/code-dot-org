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
      // Curriculum instructions are legacy content: they embed FontAwesome
      // icons as `<i class="fa-...">` (inlineStyles permits the `className` that
      // sanitization would otherwise strip) and write headings without a space
      // after the '#'s (lenientHeadings restores that).
      extensions.inlineStyles,
      extensions.lenientHeadings,
      ...(extraExtensions ?? []),
    ],
    [onInstructionsTextClick, extraExtensions],
  );

  return <Markdown {...props} extensions={markdownExtensions} />;
};

export default EnhancedMarkdown;

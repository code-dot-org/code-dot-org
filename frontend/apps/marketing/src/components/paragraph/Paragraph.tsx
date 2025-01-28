import '@code-dot-org/component-library/typography/index.css';
import {
  default as Typography,
  StrongText,
  VisualAppearance,
} from '@code-dot-org/component-library/typography';
import React, {ReactNode} from 'react';

type ParagraphVisualAppearance = Exclude<
  VisualAppearance,
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
  | 'overline-one'
  | 'overline-two'
  | 'overline-three'
  | 'strong'
  | 'extra-strong'
  | 'em'
  | 'figcaption'
>;

type ParagraphProps = {
  /** Paragraph content */
  children: ReactNode;
  /** Paragraph visual appearance */
  visualAppearance: ParagraphVisualAppearance;
  /** Whether the paragraph text is strong */
  isStrong: boolean;
};

export const paragraphEnabledBuiltInContentfulStyles = [
  'cfTextAlign',
  'cfTextUnderline',
  'cfWidth',
];

const paragraphBuiltInStylesClassNames =
  paragraphEnabledBuiltInContentfulStyles.join(' ');

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance,
  isStrong,
  children,
}) => {
  return isStrong ? (
    <Typography
      className={paragraphBuiltInStylesClassNames}
      semanticTag="p"
      visualAppearance={visualAppearance}
    >
      <StrongText>{children}</StrongText>
    </Typography>
  ) : (
    <Typography
      className={paragraphBuiltInStylesClassNames}
      semanticTag="p"
      visualAppearance={visualAppearance}
    >
      {children}
    </Typography>
  );
};

export default Paragraph;

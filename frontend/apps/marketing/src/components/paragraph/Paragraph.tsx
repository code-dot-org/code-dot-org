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

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance,
  isStrong,
  children,
}) => {
  return isStrong ? (
    <Typography semanticTag="p" visualAppearance={visualAppearance}>
      <StrongText>{children}</StrongText>
    </Typography>
  ) : (
    <Typography className={[
        'cfVisibility',
      'cfHorizontalAlignment',
      'cfVerticalAlignment',
      'cfMargin',
      'cfPadding',
      'cfBackgroundColor',
      'cfWidth',
      'cfMaxWidth',
      'cfHeight',
      'cfImageAsset',
      'cfImageOptions',
      'cfBackgroundImageUrl',
      'cfBackgroundImageOptions',
      'cfFlexDirection',
      'cfFlexWrap',
      'cfFlexReverse',
      'cfBorder',
      'cfBorderRadius',
      'cfGap',
      'cfFontSize',
      'cfFontWeight',
      'cfLineHeight',
      'cfLetterSpacing',
      'cfTextColor',
      'cfTextAlign',
      'cfTextTransform',
      'cfTextBold',
      'cfTextItalic',
      'cfTextUnderline',
      'cfBackgroundImageScaling',
      'cfBackgroundImageAlignment',
      'cfBackgroundImageAlignmentVertical',
      'cfBackgroundImageAlignmentHorizontal',].join(' ')} semanticTag="p" visualAppearance={visualAppearance}>
      {children}
    </Typography>
  );
};

export default Paragraph;

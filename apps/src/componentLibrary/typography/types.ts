import React from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  BodyOneText,
  BodyTwoText,
  BodyThreeText,
  BodyFourText,
  OverlineOneText,
  OverlineTwoText,
  OverlineThreeText,
  EmText,
  StrongText,
  ExtraStrongText,
  Figcaption,
} from '@cdo/apps/componentLibrary/typography';

type SemanticTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'strong'
  | 'em'
  | 'figcaption'
  | 'span';

type VisualAppearance =
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
  | 'body-one'
  | 'body-two'
  | 'body-three'
  | 'body-four'
  | 'overline-one'
  | 'overline-two'
  | 'overline-three'
  | 'strong'
  | 'extra-strong'
  | 'em'
  | 'figcaption';

type TypographyElement =
  | typeof Heading1
  | typeof Heading2
  | typeof Heading3
  | typeof Heading4
  | typeof Heading5
  | typeof Heading6
  | typeof BodyOneText
  | typeof BodyTwoText
  | typeof BodyThreeText
  | typeof BodyFourText
  | typeof OverlineOneText
  | typeof OverlineTwoText
  | typeof OverlineThreeText
  | typeof EmText
  | typeof StrongText
  | typeof ExtraStrongText
  | typeof Figcaption;

interface TypographyElementProps {
  // Scss module classname to use for the typography element
  visualAppearance?: VisualAppearance;
  // Additional classnames to apply to the typography element
  className?: string;
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
}

export {
  SemanticTag,
  VisualAppearance,
  TypographyElementProps,
  TypographyElement,
};

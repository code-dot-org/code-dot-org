import React from 'react';

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

export {SemanticTag, VisualAppearance, TypographyElementProps};

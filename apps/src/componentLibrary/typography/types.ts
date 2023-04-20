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
  | 'figcaption';

type VisualApproach =
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
  | 'body-one'
  | 'body-two'
  | 'overline'
  | 'strong'
  | 'em'
  | 'figcaption';

interface SpecificTypographyElementProps {
  visualApproach?: VisualApproach;
  // Additional classnames to apply to the typography element
  className?: string;
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
}

export {SemanticTag, VisualApproach, SpecificTypographyElementProps};

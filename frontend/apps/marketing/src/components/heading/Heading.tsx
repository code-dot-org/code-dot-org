import '@code-dot-org/component-library/typography/index.css';
import {
  default as Typography,
  VisualAppearance,
  SemanticTag,
} from '@code-dot-org/component-library/typography';
import React, {ReactNode} from 'react';

type HeadingVisualAppearance = Exclude<
  VisualAppearance,
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
  | 'figcaption'
>;
type HeadingSemanticTag = Exclude<
  SemanticTag,
  'p' | 'strong' | 'em' | 'figcaption' | 'span'
>;

type HeadingProps = {
  /** Heading content */
  children: ReactNode;
  /** Heading visual appearance */
  visualAppearance: HeadingVisualAppearance;
};

const headingVisualAppearanceToSemanticTagMap: Record<
  HeadingVisualAppearance,
  HeadingSemanticTag
> = {
  'heading-xxl': 'h1',
  'heading-xl': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'heading-xs': 'h6',
};

export const headingEnabledBuiltInContentfulStyles = [
  'cfTextAlign',
  'cfTextUnderline',
  'cfWidth',
];

const headingBuiltInStylesClassNames =
  headingEnabledBuiltInContentfulStyles.join(' ');

const Heading: React.FunctionComponent<HeadingProps> = ({
  visualAppearance,
  children,
}) => {
  return (
    <Typography
      semanticTag={headingVisualAppearanceToSemanticTagMap[visualAppearance]}
      className={headingBuiltInStylesClassNames}
      visualAppearance={visualAppearance}
    >
      {children}
    </Typography>
  );
};

export default Heading;

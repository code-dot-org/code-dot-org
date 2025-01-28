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
  /** ClassName passed by contentful to apply styles that are set through contentful native editor*/
  className?: string;
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

const Heading: React.FunctionComponent<HeadingProps> = ({
  visualAppearance,
  children,
  className,
}) => {
  return (
    <Typography
      semanticTag={headingVisualAppearanceToSemanticTagMap[visualAppearance]}
      className={className}
      visualAppearance={visualAppearance}
    >
      123hello {children}
    </Typography>
  );
};

export default Heading;

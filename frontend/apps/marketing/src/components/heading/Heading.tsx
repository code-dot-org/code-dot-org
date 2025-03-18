import '@code-dot-org/component-library/typography/index.css';
import {
  default as Typography,
  VisualAppearance,
  SemanticTag,
} from '@code-dot-org/component-library/typography';
import React, {ReactNode} from 'react';
import classNames from 'classnames';

import moduleStyles from './heading.module.scss';

type HeadingVisualAppearance = Extract<
  VisualAppearance,
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
>;
type HeadingSemanticTag = Extract<
  SemanticTag,
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
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
}) => (
  <Typography
    semanticTag={headingVisualAppearanceToSemanticTagMap[visualAppearance]}
    className={classNames(moduleStyles.heading, className)}
    visualAppearance={visualAppearance}
  >
    {children}
  </Typography>
);

export default Heading;

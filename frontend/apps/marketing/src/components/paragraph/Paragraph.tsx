import '@code-dot-org/component-library/typography/index.css';
import {
  default as Typography,
  StrongText,
  VisualAppearance,
} from '@code-dot-org/component-library/typography';
import React, {ReactNode} from 'react';
import classNames from 'classnames';

import moduleStyles from './paragraph.module.scss';

type ParagraphVisualAppearance = Extract<
  VisualAppearance,
  'body-one' | 'body-two' | 'body-three' | 'body-four'
>;

type ParagraphProps = {
  /** Paragraph content */
  children: ReactNode;
  /** Paragraph visual appearance */
  visualAppearance: ParagraphVisualAppearance;
  /** Whether the paragraph text is strong */
  isStrong: boolean;
  /** ClassName passed by contentful to apply styles that are set through contentful native editor*/
  className?: string;
};

const Paragraph: React.FunctionComponent<ParagraphProps> = ({
  visualAppearance,
  isStrong,
  children,
  className,
}) => (
  <Typography
    semanticTag="p"
    visualAppearance={visualAppearance}
    className={classNames(moduleStyles.paragraph, className)}
  >
    {isStrong ? <StrongText>{children}</StrongText> : children}
  </Typography>
);

export default Paragraph;

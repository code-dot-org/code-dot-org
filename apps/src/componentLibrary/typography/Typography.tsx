import classnames from 'classnames';
import React, {memo} from 'react';

import {SemanticTag, VisualAppearance} from './types';

import moduleStyles from './typography.module.scss';

interface TypographyProps {
  // Html tag to use for the typography element
  semanticTag: SemanticTag;
  // Scss module classname to use for the typography element
  visualAppearance: VisualAppearance;
  // Additional id to apply to the typography element
  id?: string;
  // Additional classnames to apply to the typography element
  className?: string;
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
}

const Typography: React.FunctionComponent<TypographyProps> = ({
  id,
  semanticTag,
  visualAppearance,
  children,
  className,
  style,
  ...props
}) => {
  const Tag = semanticTag;

  return (
    <Tag
      id={id}
      className={classnames(moduleStyles[visualAppearance], className)}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default memo(Typography);

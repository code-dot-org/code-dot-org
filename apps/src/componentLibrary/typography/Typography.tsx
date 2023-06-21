import React from 'react';
import classnames from 'classnames';
import {SemanticTag, VisualAppearance} from './types';

const styles = require('./typography.module.scss').default;

interface TypographyProps {
  // Html tag to use for the typography element
  semanticTag: SemanticTag;
  // Scss module classname to use for the typography element
  visualAppearance?: VisualAppearance;
  // Additional classnames to apply to the typography element
  className?: string;
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
}

const Typography: React.FunctionComponent<TypographyProps> = ({
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
      className={classnames(
        visualAppearance && styles[visualAppearance],
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Typography;

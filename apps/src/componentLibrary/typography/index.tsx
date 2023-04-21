import React from 'react';
import classnames from 'classnames';
import {SemanticTag, VisualApproach} from './types';

const styles = require('./typography.module.scss').default;

interface TypographyProps {
  // Html tag to use for the typography element
  semanticTag: SemanticTag;
  // Scss module classname to use for the typography element
  visualApproach?: VisualApproach;
  // Additional classnames to apply to the typography element
  className?: string;
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
}

const Typography: React.FunctionComponent<TypographyProps> = ({
  semanticTag,
  visualApproach,
  children,
  className,
  style
}) => {
  const Tag = semanticTag;

  return (
    <Tag
      className={classnames(
        visualApproach && styles[visualApproach],
        className
      )}
      style={style}
    >
      {children}
    </Tag>
  );
};

export * from './SpecificComponentsGenerator';
export default Typography;

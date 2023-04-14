import React from 'react';
import Typography, {VisualApproach} from './../index';

interface FigcaptionProps {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Figcaption: React.FunctionComponent<FigcaptionProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="figcaption"
      visualApproach={visualApproach || 'figcaption'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Figcaption;

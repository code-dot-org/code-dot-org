import React from 'react';
import Typography, {VisualApproach} from './../index';

interface Heading5Props {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Heading5: React.FunctionComponent<Heading5Props> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="h5"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading5;

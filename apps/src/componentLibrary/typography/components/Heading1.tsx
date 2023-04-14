import React from 'react';
import Typography, {VisualApproach} from './../index';

interface Heading1Props {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Heading1: React.FunctionComponent<Heading1Props> = ({
  visualApproach,
  className,
  style,
  children
}: Heading1Props) => {
  return (
    <Typography
      semanticTag="h1"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading1;

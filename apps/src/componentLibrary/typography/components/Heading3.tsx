import React from 'react';
import Typography, {VisualApproach} from './../index';

interface Heading3Props {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Heading3: React.FunctionComponent<Heading3Props> = ({
  visualApproach,
  className,
  style,
  children
}: Heading3Props) => {
  return (
    <Typography
      semanticTag="h3"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading3;

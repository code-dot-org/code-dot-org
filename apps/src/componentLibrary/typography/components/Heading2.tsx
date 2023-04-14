import React from 'react';
import Typography, {VisualApproach} from './../index';

type Heading2Props = {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const Heading2: React.FunctionComponent<Heading2Props> = ({
  visualApproach,
  className,
  style,
  children
}: Heading2Props) => {
  return (
    <Typography
      semanticTag="h2"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading2;

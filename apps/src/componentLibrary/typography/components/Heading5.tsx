import React from 'react';
import Typography, {VisualApproach} from './../index';

type Heading5Props = {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const Heading5: React.FunctionComponent<Heading5Props> = ({
  visualApproach,
  className,
  style,
  children
}: Heading5Props) => {
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

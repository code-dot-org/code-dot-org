import React from 'react';
import Typography, {VisualApproach} from './../index';

type Heading6Props = {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const Heading6: React.FunctionComponent<Heading6Props> = ({
  visualApproach,
  className,
  style,
  children
}: Heading6Props) => {
  return (
    <Typography
      semanticTag="h6"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading6;

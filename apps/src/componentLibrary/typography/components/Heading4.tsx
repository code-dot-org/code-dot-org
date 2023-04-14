import React from 'react';
import Typography, {VisualApproach} from './../index';

interface Heading4Props {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Heading4: React.FunctionComponent<Heading4Props> = ({
  visualApproach,
  className,
  style,
  children
}: Heading4Props) => {
  return (
    <Typography
      semanticTag="h4"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading4;

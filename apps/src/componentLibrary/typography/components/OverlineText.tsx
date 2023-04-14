import React from 'react';
import Typography, {VisualApproach} from './../index';

interface OverlineTextProps {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const OverlineText: React.FunctionComponent<OverlineTextProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="p"
      visualApproach={visualApproach || 'overline'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default OverlineText;

import React from 'react';
import Typography, {VisualApproach} from './../index';

interface StrongTextProps {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const StrongText: React.FunctionComponent<StrongTextProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="strong"
      visualApproach={visualApproach || 'strong'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default StrongText;

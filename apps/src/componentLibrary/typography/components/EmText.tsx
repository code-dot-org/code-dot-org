import React from 'react';
import Typography, {VisualApproach} from './../index';

interface EmTextProps {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const EmText: React.FunctionComponent<EmTextProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="em"
      visualApproach={visualApproach || 'em'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default EmText;

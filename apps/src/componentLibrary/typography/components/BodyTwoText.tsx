import React from 'react';
import Typography, {VisualApproach} from './../index';

interface BodyTwoTextProps {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const BodyTwoText: React.FunctionComponent<BodyTwoTextProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="p"
      visualApproach={visualApproach || 'body-two'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default BodyTwoText;

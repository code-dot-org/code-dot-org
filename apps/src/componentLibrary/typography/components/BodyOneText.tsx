import React from 'react';
import Typography, {VisualApproach} from './../index';

interface BodyOneTextProps {
  visualApproach?: VisualApproach;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const BodyOneText: React.FunctionComponent<BodyOneTextProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="p"
      visualApproach={visualApproach || 'body-one'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default BodyOneText;

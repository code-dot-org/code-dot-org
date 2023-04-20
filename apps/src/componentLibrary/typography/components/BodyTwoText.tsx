import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const BodyTwoText: React.FunctionComponent<SpecificTypographyElementProps> = ({
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

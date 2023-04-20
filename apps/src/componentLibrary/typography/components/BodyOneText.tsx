import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const BodyOneText: React.FunctionComponent<SpecificTypographyElementProps> = ({
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

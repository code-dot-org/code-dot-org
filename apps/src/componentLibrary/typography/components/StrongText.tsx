import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const StrongText: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="strong"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default StrongText;

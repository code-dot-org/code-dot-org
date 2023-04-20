import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const Heading1: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="h1"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading1;

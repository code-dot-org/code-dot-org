import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const Heading3: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="h3"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading3;

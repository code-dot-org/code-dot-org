import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const Heading6: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="h6"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Heading6;

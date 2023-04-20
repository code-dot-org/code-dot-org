import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const Figcaption: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="figcaption"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default Figcaption;

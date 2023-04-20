import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const EmText: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="em"
      visualApproach={visualApproach}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default EmText;

import React from 'react';
import Typography from './../index';
import {SpecificTypographyElementProps} from '../types';

const OverlineText: React.FunctionComponent<SpecificTypographyElementProps> = ({
  visualApproach,
  className,
  style,
  children
}) => {
  return (
    <Typography
      semanticTag="p"
      visualApproach={visualApproach || 'overline'}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );
};

export default OverlineText;

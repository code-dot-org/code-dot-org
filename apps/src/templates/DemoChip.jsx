import {Chip} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const DemoChip = ({size = 'small', className}) => (
  <Chip
    className={className}
    label="Demo"
    size={size}
    color="default"
    sx={{
      ml: 1,
      ...(size === 'small'
        ? {height: 18, maxHeight: 18}
        : {
            '& .MuiChip-label': {
              fontSize: '1rem',
              lineHeight: 1.25,
            },
            height: 24,
            maxHeight: 24,
          }),
    }}
  />
);

DemoChip.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default DemoChip;

import { PropTypes } from 'react';

export const levelType = (
  PropTypes.shape({
    status: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string
  })
);

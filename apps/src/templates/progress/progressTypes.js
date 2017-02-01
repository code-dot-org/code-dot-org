import { PropTypes } from 'react';

export const lessonType = (
  PropTypes.shape({
    status: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string
  })
);

import { PropTypes } from 'react';

export const levelType = (
  PropTypes.shape({
    status: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string,
    icon: PropTypes.string
  })
);

export const lessonType = (
  PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  })
);

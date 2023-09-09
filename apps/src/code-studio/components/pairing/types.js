import PropTypes from 'prop-types';

export const studentsShape = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  })
);

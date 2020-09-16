import PropTypes from 'prop-types';

export const position = PropTypes.shape({
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired
});

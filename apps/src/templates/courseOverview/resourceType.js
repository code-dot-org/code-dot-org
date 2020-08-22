import PropTypes from 'prop-types';

export const resourceShape = PropTypes.shape({
  type: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired
});

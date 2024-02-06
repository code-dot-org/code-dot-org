import PropTypes from 'prop-types';

export const levelShape = PropTypes.shape({
  id: PropTypes.number,
  type: PropTypes.string,
  hasValidation: PropTypes.bool,
  isProjectBacked: PropTypes.bool,
});

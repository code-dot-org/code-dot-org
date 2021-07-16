import PropTypes from 'prop-types';

export const resultsShape = PropTypes.shape({
  examples: PropTypes.arrayOf(PropTypes.array).isRequired,
  labels: PropTypes.array.isRequired,
  predictedLabels: PropTypes.array.isRequired
});

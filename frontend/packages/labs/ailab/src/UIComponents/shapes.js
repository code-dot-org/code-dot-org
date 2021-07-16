import PropTypes from 'prop-types';

export const resultsShape = PropTypes.shape({
  examples: PropTypes.arrayOf(PropTypes.array).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  predictedLabels: PropTypes.arrayOf(PropTypes.string).isRequired
});

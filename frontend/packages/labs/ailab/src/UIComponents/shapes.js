import PropTypes from "prop-types";

export const resultsPropType = PropTypes.shape({
  examples: PropTypes.arrayOf(PropTypes.array).isRequired,
  labels: PropTypes.array.isRequired,
  predictedLabels: PropTypes.array.isRequired
});

export const categeoricalColumnDetailsShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  uniqueOptions: PropTypes.array.isRequired,
  frequencies: PropTypes.objectOf(PropTypes.number).isRequired
});

export const numericalColumnDetailsShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  extrema: PropTypes.objectOf(PropTypes.number).isRequired,
  containsOnlyNumbers: PropTypes.bool.isRequired
});

export const currentColumnInspectorShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
  dataType: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isSelectable: PropTypes.bool.isRequired
});

export const crossTabDataShape = PropTypes.shape({
  labelName: PropTypes.string.isRequired,
  featureNames: PropTypes.array.isRequired,
  results: PropTypes.arrayOf(PropTypes.objectOf).isRequired
});

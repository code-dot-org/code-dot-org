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
  uniqueLabelValues: PropTypes.array.isRequired,
  featureNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  results: PropTypes.arrayOf(PropTypes.objectOf).isRequired
});

export const metadataShape = PropTypes.shape({
  name: PropTypes.string,
  card: metadataCardShape,
  defaultLabelColumn: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.oneOf(['numerical', 'categorical'])
  }))
});

const metadataCardShape = PropTypes.shape({
  description: PropTypes.string,
  context: metadataContextShape,
  lastUpdated: PropTypes.string,
  source: PropTypes.string
});

const metadataContextShape = PropTypes.shape({
  createdBy: PropTypes.string,
  potentialMisuses: PropTypes.string,
  potentialUses: PropTypes.string
});

export const trainedModelDetailsShape = PropTypes.shape({
  // classes: PropTypes.arrayOf(PropTypes.number).isRequired,
  // isEuclidean: PropTypes.bool.isRequired,
  // k: PropTypes.number.isRequired,
  // kdTree: PropTypes.object.isRequired,
  // name: PropTypes.string.isRequired
});

export const modelCardLabelShape = PropTypes.shape({
  description: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired
});

export const modelCardDatasetDetailsShape = PropTypes.shape({
  description: PropTypes.string.isRequired,
  isUserUploaded: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  numRows: PropTypes.number.isRequired
});

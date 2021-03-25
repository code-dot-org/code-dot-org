import PropTypes from 'prop-types';

export const lessonShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  position: PropTypes.number.isRequired,
  displayName: PropTypes.string.isRequired,
  vocabularies: PropTypes.array.isRequired,
  programmingExpressions: PropTypes.array.isRequired,
  preparation: PropTypes.string,
  resources: PropTypes.object.isRequired
});
export const unitShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  lessons: PropTypes.arrayOf(lessonShape)
});

export const courseShape = PropTypes.shape({
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  units: PropTypes.arrayOf(unitShape)
});

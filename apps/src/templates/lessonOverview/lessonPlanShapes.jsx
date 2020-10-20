import PropTypes from 'prop-types';

export const lessonShape = PropTypes.shape({
  unit: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    lessons: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        position: PropTypes.number.isRequired,
        displayName: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  purpose: PropTypes.string.isRequired,
  preparation: PropTypes.string.isRequired
});

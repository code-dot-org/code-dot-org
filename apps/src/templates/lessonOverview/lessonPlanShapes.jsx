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
        link: PropTypes.string.isRequired,
        lockable: PropTypes.bool.isRequired
      })
    ).isRequired
  }).isRequired,
  position: PropTypes.number.isRequired,
  lockable: PropTypes.bool.isRequired,
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  purpose: PropTypes.string.isRequired,
  preparation: PropTypes.string.isRequired,
  resources: PropTypes.object,
  objectives: PropTypes.arrayOf(PropTypes.object).isRequired,
  assessmentOpportunities: PropTypes.string.isRequired
});

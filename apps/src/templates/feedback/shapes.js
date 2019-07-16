import PropTypes from 'prop-types';

const shapes = {
  feedback: PropTypes.shape({
    seenByStudent: PropTypes.bool.isRequired,
    lessonName: PropTypes.string.isRequired,
    levelNum: PropTypes.string.isRequired,
    linkToLevel: PropTypes.string.isRequired,
    unitName: PropTypes.string,
    linkToUnit: PropTypes.string,
    lastUpdated: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]).isRequired,
    comment: PropTypes.string
  })
};

export default shapes;

import PropTypes from 'prop-types';

const shapes = {
  feedback: PropTypes.shape({
    seen_on_feedback_page_at: PropTypes.string,
    student_first_visited_at: PropTypes.string,
    lessonName: PropTypes.string.isRequired,
    lessonNum: PropTypes.number.isRequired,
    levelNum: PropTypes.number.isRequired,
    linkToLevel: PropTypes.string.isRequired,
    unitName: PropTypes.string,
    created_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]).isRequired,
    comment: PropTypes.string,
    performance: PropTypes.string
  })
};

export default shapes;

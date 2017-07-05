/* Common shapes used for React prop validation.
 */

import { PropTypes } from 'react';

const shapes = {
  // Though this shape is called "courses", it's really a set of info about
  // courses and/or scripts (but they have the same data shape).
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
    })
  ),
  studentTopCourse: PropTypes.shape({
    assignableName: PropTypes.string.isRequired,
    linkToOverview: PropTypes.string.isRequired,
    linkToLesson: PropTypes.string.isRequired,
    lessonName: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  })
};

export default shapes;

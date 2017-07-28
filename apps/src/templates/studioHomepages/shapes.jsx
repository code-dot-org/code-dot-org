/* Common shapes used for React prop validation.
 */

import { PropTypes } from 'react';

const shapes = {
  // Though this shape is called "courses", it's really a set of info about
  // courses and/or scripts (but they have the same data shape).
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
    })
  ),
  studentTopCourse: PropTypes.shape({
    assignableName: PropTypes.string.isRequired,
    linkToOverview: PropTypes.string.isRequired,
    linkToLesson: PropTypes.string.isRequired,
    lessonName: PropTypes.string.isRequired,
  }),
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      teacherName: PropTypes.string.isRequired,
      linkToProgress: PropTypes.string.isRequired,
      assignedTitle: PropTypes.string.isRequired,
      linkToAssigned: PropTypes.string.isRequired,
      numberOfStudents: PropTypes.number.isRequired,
      linkToStudents: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    })
  )
};

export default shapes;

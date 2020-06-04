/* Common shapes used for React prop validation.
 */

import PropTypes from 'prop-types';

const shapes = {
  // Though this shape is called "courses", it's really a set of info about
  // courses and/or scripts (but they have the same data shape).
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired
    })
  ),
  topCourse: PropTypes.shape({
    assignableName: PropTypes.string.isRequired,
    linkToOverview: PropTypes.string.isRequired,
    linkToLesson: PropTypes.string.isRequired,
    lessonName: PropTypes.string.isRequired
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
      login_type: PropTypes.string,
      code: PropTypes.string.isRequired
    })
  ),
  teacherAnnouncement: PropTypes.shape({
    heading: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    type: PropTypes.string,
    id: PropTypes.string.isRequired
  }),
  specialAnnouncement: PropTypes.shape({
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    buttonId: PropTypes.string,
    buttonUrl: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    buttonId2: PropTypes.string,
    buttonUrl2: PropTypes.string,
    buttonText2: PropTypes.string,
    backgroundColor: PropTypes.string
  })
};

export default shapes;

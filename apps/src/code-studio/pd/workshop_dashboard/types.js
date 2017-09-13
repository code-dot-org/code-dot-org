import {PropTypes} from 'react';

const workshopShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  sessions: PropTypes.array.isRequired,
  location_name: PropTypes.string.isRequired,
  location_address: PropTypes.string,
  on_map: PropTypes.bool.isRequired,
  funded: PropTypes.bool.isRequired,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  enrolled_teacher_count: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
  facilitators: PropTypes.array.isRequired,
  organizer: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired,
  enrollment_code: PropTypes.string
});

const enrollmentShape = PropTypes.shape({
  first_name: PropTypes.string.isRequired,
  last_name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  district_name: PropTypes.string,
  school: PropTypes.string.isRequired,
  user_id: PropTypes.number,
  attended: PropTypes.bool.isRequired,
  pre_workshop_survey: PropTypes.shape({
    unit: PropTypes.string,
    lesson: PropTypes.string,
    questionsAndTopics: PropTypes.string,
    unitLessonShortName: PropTypes.string
  })
});

export {workshopShape, enrollmentShape};

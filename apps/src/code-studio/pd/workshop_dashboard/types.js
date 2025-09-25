import PropTypes from 'prop-types';

const workshopShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  sessions: PropTypes.array.isRequired,
  location_name: PropTypes.string,
  location_address: PropTypes.string,
  on_map: PropTypes.bool,
  funded: PropTypes.bool,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  course_offering_names: PropTypes.string,
  title: PropTypes.string,
  enrolled_teacher_count: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
  facilitators: PropTypes.array.isRequired,
  organizer: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  enrollment_code: PropTypes.string,
  workshop_starting_date: PropTypes.string,
  pre_workshop_survey_url: PropTypes.string,
});

const enrollmentShape = PropTypes.shape({
  user_info: PropTypes.shape({
    given_name: PropTypes.string.isRequired,
    family_name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    school_name: PropTypes.string,
    district_name: PropTypes.string,
  }).isRequired,
  role: PropTypes.string,
  grades_teaching: PropTypes.arrayOf(PropTypes.string),
  user_id: PropTypes.number,
  attended: PropTypes.bool.isRequired,
  scholarship_status: PropTypes.string,
  pre_workshop_survey: PropTypes.shape({
    unit: PropTypes.string,
    lesson: PropTypes.string,
    questionsAndTopics: PropTypes.string,
    unitLessonShortName: PropTypes.string,
  }),
});

export {workshopShape, enrollmentShape};

import React from 'react';

const workshopShape = React.PropTypes.shape({
  id: React.PropTypes.number.isRequired,
  sessions: React.PropTypes.array.isRequired,
  location_name: React.PropTypes.string.isRequired,
  location_address: React.PropTypes.string,
  on_map: React.PropTypes.bool.isRequired,
  funded: React.PropTypes.bool.isRequired,
  course: React.PropTypes.string.isRequired,
  subject: React.PropTypes.string,
  enrolled_teacher_count: React.PropTypes.number.isRequired,
  capacity: React.PropTypes.number.isRequired,
  facilitators: React.PropTypes.array.isRequired,
  organizer: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired
  }).isRequired,
  enrollment_code: React.PropTypes.string
});

const enrollmentShape = React.PropTypes.shape({
  first_name: React.PropTypes.string.isRequired,
  last_name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  district_name: React.PropTypes.string,
  school: React.PropTypes.string.isRequired,
  user_id: React.PropTypes.number,
  attended: React.PropTypes.bool.isRequired,
  pre_workshop_survey: React.PropTypes.shape({
    unit: React.PropTypes.string,
    lesson: React.PropTypes.string,
    questionsAndTopics: React.PropTypes.string,
    unitLessonShortName: React.PropTypes.string
  })
});

export {workshopShape, enrollmentShape};

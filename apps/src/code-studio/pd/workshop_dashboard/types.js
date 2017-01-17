import React from 'react';

const workshopShape = React.PropTypes.shape({
  id: React.PropTypes.number.isRequired,
  sessions: React.PropTypes.array.isRequired,
  location_name: React.PropTypes.string.isRequired,
  workshop_type: React.PropTypes.string.isRequired,
  course: React.PropTypes.string.isRequired,
  enrolled_teacher_count: React.PropTypes.number.isRequired,
  capacity: React.PropTypes.number.isRequired,
  facilitators: React.PropTypes.array.isRequired,
  organizer: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired
  }).isRequired
});

module.exports.workshopShape = workshopShape;

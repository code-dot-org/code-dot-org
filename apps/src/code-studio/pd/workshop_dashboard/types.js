import PropTypes from 'prop-types';

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

module.exports.workshopShape = workshopShape;

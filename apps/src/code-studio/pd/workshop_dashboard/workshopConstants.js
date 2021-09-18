import PropTypes from 'prop-types';

const TIME_FORMAT = 'h:mma';
const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;
const COURSE_CSF = 'CS Fundamentals';

const MAX_SESSIONS = 10;

export {TIME_FORMAT, DATE_FORMAT, DATETIME_FORMAT, MAX_SESSIONS, COURSE_CSF};

export const workshopShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  facilitators: PropTypes.array.isRequired,
  location_name: PropTypes.string.isRequired,
  location_address: PropTypes.string,
  capacity: PropTypes.number.isRequired,
  on_map: PropTypes.bool.isRequired,
  funded: PropTypes.bool.isRequired,
  funding_type: PropTypes.string,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  fee: PropTypes.string,
  notes: PropTypes.string,
  sessions: PropTypes.array.isRequired,
  enrolled_teacher_count: PropTypes.number.isRequired,
  regional_partner_name: PropTypes.string,
  regional_partner_id: PropTypes.number,
  virtual: PropTypes.bool,
  third_party_provider: PropTypes.string,
  suppress_email: PropTypes.bool,
  organizer: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })
});

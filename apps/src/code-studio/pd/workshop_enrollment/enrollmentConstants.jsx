import PropTypes from 'prop-types';

const WorkshopPropType = PropTypes.shape({
  id: PropTypes.number,
  course: PropTypes.string,
  course_url: PropTypes.string,
  location_name: PropTypes.string,
  location_address: PropTypes.string,
  subject: PropTypes.string,
  notes: PropTypes.string,
  regional_partner: PropTypes.shape({
    name: PropTypes.string
  }),
  organizer: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  }),
  virtual: PropTypes.bool
});

const FacilitatorPropType = PropTypes.shape({
  email: PropTypes.string,
  image_path: PropTypes.string,
  bio: PropTypes.string
});

export {WorkshopPropType, FacilitatorPropType};

import PropTypes from 'prop-types';

export const curriculaDataShape = PropTypes.shape({
  id: PropTypes.string,
  key: PropTypes.string,
  display_name: PropTypes.string.isRequired,
  category: PropTypes.string,
  is_featured: PropTypes.bool,
  assignable: PropTypes.bool,
  curriculum_type: PropTypes.string,
  marketing_initiative: PropTypes.string,
  grade_levels: PropTypes.string.isRequired,
  header: PropTypes.string,
  image: PropTypes.string,
  cs_topic: PropTypes.string.isRequired,
  school_subject: PropTypes.string.isRequired,
  device_compatibility: PropTypes.string
});

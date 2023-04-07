import PropTypes from 'prop-types';

export const curriculaDataShape = PropTypes.shape({
  id: PropTypes.string,
  key: PropTypes.string,
  display_name: PropTypes.string,
  category: PropTypes.string,
  is_featured: PropTypes.bool,
  assignable: PropTypes.bool,
  curriculum_type: PropTypes.string,
  marketing_initiative: PropTypes.string,
  grade_levels: PropTypes.string,
  header: PropTypes.string,
  image: PropTypes.string,
  cs_topic: PropTypes.string,
  school_subject: PropTypes.string,
  device_compatibility: PropTypes.string
});

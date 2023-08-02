import PropTypes from 'prop-types';

export const curriculumDataShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  display_name: PropTypes.string.isRequired,
  display_name_with_latest_year: PropTypes.string.isRequired,
  grade_levels: PropTypes.string,
  image: PropTypes.string,
  cs_topic: PropTypes.string,
  school_subject: PropTypes.string,
  device_compatibility: PropTypes.string,
  course_version_path: PropTypes.string,
});

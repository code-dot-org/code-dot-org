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
  marketing_initiative: PropTypes.string,
});

export const defaultImageSrc =
  'https://images.code.org/0a24eb3b51bd86e054362f0760c6e64e-image-1681413990565.png';

export const curriculumCatalogCardIdPrefix = 'curriculum-catalog-card-';

import {PropTypes} from 'react';

export const projectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  publishedToPublic: PropTypes.bool.isRequired,
  publishedToClass: PropTypes.bool.isRequired,
});

export const projectPropType = PropTypes.shape({
  projectData: projectDataPropType.isRequired,
  currentGallery: PropTypes.string.isRequired,
});

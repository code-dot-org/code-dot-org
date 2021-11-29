import PropTypes from 'prop-types';

export const projectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  publishedToPublic: PropTypes.bool.isRequired
});

export const personalProjectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  isPublished: PropTypes.bool,
  projectNameFailure: PropTypes.string
});

export const featuredProjectDataPropType = PropTypes.shape({
  projectName: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  topic: PropTypes.string,
  publishedAt: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  featuredAt: PropTypes.string.isRequired,
  unfeaturedAt: PropTypes.string
});

export const projectPropType = PropTypes.shape({
  projectData: projectDataPropType.isRequired,
  currentGallery: PropTypes.string.isRequired
});

export const Galleries = {
  PUBLIC: 'PUBLIC',
  LIBRARIES: 'LIBRARIES',
  PRIVATE: 'PRIVATE'
};

export const featuredProjectTableTypes = {
  current: 'currentFeatured',
  archived: 'archivedUnfeatured'
};

export const MAX_PROJECTS_PER_CATEGORY = 100;

// The project table uses the channels API to populate the personal projects
// and the data needs to be filtered and mapped before displaying.
export const convertChannelsToProjectData = function(projects) {
  // Get the ones that aren't hidden, and have a type and id.
  let projectLists = projects.filter(
    project => !project.hidden && project.id && project.projectType
  );
  return projectLists.map(project => ({
    name: project.name,
    channel: project.id,
    thumbnailUrl: project.thumbnailUrl,
    type: project.projectType,
    isPublished: project.publishedAt !== null,
    updatedAt: project.updatedAt
  }));
};

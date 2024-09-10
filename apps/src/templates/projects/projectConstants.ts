import PropTypes from 'prop-types';

import {Channel} from '@cdo/apps/lab2/types';
import musicNoteProjectCardImage from '@cdo/static/music/music-note-project-card.png';

export const publishedFeaturedProjectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  publishedToPublic: PropTypes.bool.isRequired,
  featuredAt: PropTypes.string,
});

export const personalProjectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  isPublished: PropTypes.bool,
  projectNameFailure: PropTypes.string,
});

export const featuredProjectDataPropType = PropTypes.shape({
  projectName: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  topic: PropTypes.string,
  publishedAt: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  featuredAt: PropTypes.string,
  unfeaturedAt: PropTypes.string,
});

export const publishedFeaturedProjectPropType = PropTypes.shape({
  projectData: publishedFeaturedProjectDataPropType,
  currentGallery: PropTypes.string,
});

export const Galleries = {
  PUBLIC: 'PUBLIC',
  LIBRARIES: 'LIBRARIES',
  PRIVATE: 'PRIVATE',
};

export const MAX_PROJECTS_PER_CATEGORY = 100;

// The project table uses the channels API to populate the personal projects
// and the data needs to be filtered and mapped before displaying.
export const convertChannelsToProjectData = function (projects: Channel[]) {
  // Get the ones that aren't hidden, and have a type and id.
  const projectLists = projects.filter(
    project => !project.hidden && project.id && project.projectType
  );
  return projectLists.map(project => ({
    name: project.name,
    channel: project.id,
    thumbnailUrl: project.thumbnailUrl,
    type: project.projectType,
    isPublished: project.publishedAt !== null,
    updatedAt: project.updatedAt,
  }));
};

export const PROJECT_DEFAULT_IMAGE =
  '/blockly/media/projects/project_default.png';

export const PROJECT_DEFAULT_CARD_IMAGE_OVERRIDE: {
  [projectType: string]: string;
} = {
  music: musicNoteProjectCardImage,
};

export const PROJECT_DEFAULT_THUMBNAIL_IMAGE_OVERRIDE: {
  [projectType: string]: string;
} = {
  music: '/shared/images/fill-70x70/courses/logo_music.png',
};

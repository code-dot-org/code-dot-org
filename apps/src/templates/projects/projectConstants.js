import PropTypes from 'prop-types';
import i18n from "@cdo/locale";

export const projectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  publishedToPublic: PropTypes.bool.isRequired,
});


export const personalProjectDataPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  isPublished: PropTypes.bool
});

export const featuredProjectDataPropType = PropTypes.shape({
  projectName: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  featuredAt: PropTypes.string.isRequired,
  unfeaturedAt: PropTypes.string,
});

export const projectPropType = PropTypes.shape({
  projectData: projectDataPropType.isRequired,
  currentGallery: PropTypes.string.isRequired,
});

export const Galleries = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

export const featuredProjectTableTypes = {
  current: 'currentFeatured',
  archived: 'archivedUnfeatured'
};

export const MAX_PROJECTS_PER_CATEGORY = 100;

/**
 * Map from project type to friendly name.
 * @type {Object}
 */

export const PROJECT_TYPE_MAP = {
  algebra_game: i18n.projectTypeAlgebra(),
  applab: i18n.projectTypeApplab(),
  artist: i18n.projectTypeArtist(),
  frozen: i18n.projectTypeFrozen(),
  gumball: i18n.projectTypeGumball(),
  infinity: i18n.projectTypeInfinity(),
  iceage: i18n.projectTypeIceage(),
  minecraft_adventurer: i18n.projectTypeMinecraft(),
  minecraft_designer: i18n.projectTypeMinecraft(),
  minecraft_hero: i18n.projectTypeMinecraft(),
  minecraft_aquatic: i18n.projectTypeMinecraft(),
  gamelab: i18n.projectTypeGamelab(),
  playlab: i18n.projectTypePlaylab(),
  weblab: i18n.projectTypeWeblab(),
  bounce: i18n.projectTypeBounce(),
  flappy: i18n.projectTypeFlappy(),
  starwars: i18n.projectTypeStarwars(),
  starwarsblocks: i18n.projectTypeStarwarsBlocks(),
  sports: i18n.projectTypeSports(),
  basketball: i18n.projectTypeBasketball(),
  artist_k1: i18n.projectTypeArtistPreReader(),
  playlab_k1: i18n.projectTypePlaylabPreReader(),
  eval: i18n.projectTypeEval(),
  calc: i18n.projectTypeCalc(),
  dance: i18n.projectTypeDance(),
  spritelab: i18n.projectTypeSpriteLab()
};

export const FEATURED_PROJECT_TYPE_MAP = {
  applab: i18n.projectTypeApplab(),
  artist: i18n.projectTypeDrawing(),
  frozen: i18n.projectTypeDrawing(),
  gamelab: i18n.projectTypeGamelab(),
  playlab: i18n.projectTypePlaylab(),
  gumball: i18n.projectTypePlaylab(),
  infinity: i18n.projectTypePlaylab(),
  iceage: i18n.projectTypePlaylab(),
  minecraft_adventurer: i18n.projectTypeMinecraft(),
  minecraft_designer: i18n.projectTypeMinecraft(),
  minecraft_hero: i18n.projectTypeMinecraft(),
  minecraft_aquatic: i18n.projectTypeMinecraft(),
  bounce: i18n.projectTypeEvents(),
  flappy: i18n.projectTypeEvents(),
  starwars: i18n.projectTypeEvents(),
  starwarsblocks: i18n.projectTypeEvents(),
  sports: i18n.projectTypeEvents(),
  basketball: i18n.projectTypeEvents(),
  artist_k1: i18n.projectTypeK1(),
  playlab_k1: i18n.projectTypeK1(),
  dance: i18n.projectTypeDance(),
  spritelab: i18n.projectTypeSpriteLab()
};

// The project table uses the channels API to populate the personal projects
// and the data needs to be filtered and mapped before displaying.
export const convertChannelsToProjectData = function (projects) {
  // Get the ones that aren't hidden, and have a type and id.
  let projectLists = projects.filter(project => !project.hidden && project.id && project.projectType);
  return projectLists.map(project => (
    {
      name: project.name,
      channel: project.id,
      thumbnailUrl: project.thumbnailUrl,
      type: project.projectType,
      isPublished: project.publishedAt !== null,
      updatedAt: project.updatedAt
    }
  ));
};

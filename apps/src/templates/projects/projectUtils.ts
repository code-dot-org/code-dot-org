import {
  PROJECT_DEFAULT_IMAGE,
  PROJECT_DEFAULT_THUMBNAIL_IMAGE_OVERRIDE,
  PROJECT_DEFAULT_CARD_IMAGE_OVERRIDE,
} from './projectConstants';

export const getThumbnailUrl = (path: string, type: string) =>
  path ||
  PROJECT_DEFAULT_THUMBNAIL_IMAGE_OVERRIDE[type] ||
  PROJECT_DEFAULT_IMAGE;

export const getProjectCardImageUrl = (path: string, type: string) =>
  path || PROJECT_DEFAULT_CARD_IMAGE_OVERRIDE[type] || PROJECT_DEFAULT_IMAGE;

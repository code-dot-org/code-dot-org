import {
  PROJECT_DEFAULT_IMAGE,
  PROJECT_DEFAULT_IMAGE_OVERRIDE,
} from './projectConstants';

export const getThumbnailUrl = (
  path: string,
  type: keyof typeof PROJECT_DEFAULT_IMAGE_OVERRIDE
) => path || PROJECT_DEFAULT_IMAGE_OVERRIDE[type] || PROJECT_DEFAULT_IMAGE;

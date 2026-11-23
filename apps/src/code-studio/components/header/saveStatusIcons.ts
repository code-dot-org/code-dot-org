import {ProjectState} from '@cdo/apps/code-studio/projectRedux';

/** The cloud icon and its label for each of the project's save statuses. */
export const SAVE_STATUS_ICONS: Record<
  ProjectState['projectUpdatedStatus'],
  {iconName: string; title: string}
> = {
  default: {iconName: 'cloud', title: 'Not saved'},
  saving: {iconName: 'cloud-arrow-up', title: 'Saving'},
  saved: {iconName: 'cloud-check', title: 'Saved'},
  error: {iconName: 'cloud-exclamation', title: 'Save failed'},
};

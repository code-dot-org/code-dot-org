// A showcase level shows the student's site and nothing else: the preview
// without its header, in preview mode, with no toggle to the code. The flag
// changes only what shows, so it composes with widget view or widget2
// rather than repeating what they decide about the project.

import {ViewMode, Weblab2LevelProperties} from './types';

/** Whether the preview shows without its header: a widget2 or showcase level. */
export const hidesPreviewHeader = (levelProperties: Weblab2LevelProperties) =>
  !!levelProperties.widget2 || !!levelProperties.showcase;

/** The view mode a level opens in: preview for a showcase, else its own, else split. */
export const startingViewMode = (levelProperties: Weblab2LevelProperties) =>
  levelProperties.showcase
    ? ViewMode.PREVIEW
    : levelProperties.initialViewMode || ViewMode.SPLIT;

/** Whether the view mode toggle is left out, as a showcase has no other mode. */
export const hidesViewModeToggle = (levelProperties: Weblab2LevelProperties) =>
  !!levelProperties.showcase;

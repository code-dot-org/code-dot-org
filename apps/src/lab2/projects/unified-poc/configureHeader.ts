import header from '@cdo/apps/code-studio/header';

import {LevelProperties} from '../../types';

export default function configureHeader(
  isOwner: boolean,
  levelProperties: LevelProperties
) {
  const hideShareAndRemix = levelProperties.hideShareAndRemix !== false;
  const isProjectLevel = levelProperties.isProjectLevel;
  if (isOwner) {
    if (isProjectLevel) {
      // Standalone projects see project header (includes rename option).
      // Standalone projects always show share and remix.
      header.showProjectHeader();
    } else {
      // Project backed levels see project backed header, which can
      // conditionally show share and remix.
      header.showHeaderForProjectBacked({
        showShareAndRemix: !hideShareAndRemix,
      });
    }
  } else if (isProjectLevel) {
    // If we are viewing another user's project, and this is a standalone
    // project, show the minimal project header (project name and remix button).
    header.showMinimalProjectHeader();
  }
}

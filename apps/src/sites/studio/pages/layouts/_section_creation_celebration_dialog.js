import React from 'react';

import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import SectionCreationCelebrationDialog from '@cdo/apps/templates/sectionsRefresh/SectionCreationCelebrationDialog';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  updateQueryParam('showSectionCreationDialog', undefined, true);
  createReactRoot(<SectionCreationCelebrationDialog />, mountPoint);
});

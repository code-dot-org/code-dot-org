import React from 'react';
import {createRoot} from 'react-dom/client';

import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import SectionCreationCelebrationDialog from '@cdo/apps/templates/sectionsRefresh/SectionCreationCelebrationDialog';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  updateQueryParam('showSectionCreationDialog', undefined, true);
  const root = createRoot(mountPoint);
  root.render(<SectionCreationCelebrationDialog />);
});

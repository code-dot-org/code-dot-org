import React from 'react';
import ReactDOM from 'react-dom';
import SectionCreationCelebrationDialog from '@cdo/apps/templates/sectionsRefresh/SectionCreationCelebrationDialog';
import codeStudioUtils from '@cdo/apps/code-studio/utils';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  codeStudioUtils.updateQueryParam(
    'showSectionCreationDialog',
    undefined,
    true
  );
  ReactDOM.render(<SectionCreationCelebrationDialog />, mountPoint);
});

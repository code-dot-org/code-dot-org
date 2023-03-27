import React from 'react';
import ReactDOM from 'react-dom';
import SectionCreationCelebrationDialog from '@cdo/apps/templates/sectionsRefresh/SectionCreationCelebrationDialog';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  ReactDOM.render(<SectionCreationCelebrationDialog />, mountPoint);
});

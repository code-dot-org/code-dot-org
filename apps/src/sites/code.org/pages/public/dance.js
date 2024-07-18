import React from 'react';
import {createRoot} from 'react-dom/client';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';

const DANCE_PROJECTS = [
  {
    name: 'After Party',
    studentName: 'M',
    studentAgeRange: '18',
    key: 'after_party_project',
    channel: 'PFutNmyVGt9Nj1pyl_JontH303cOEx6pJpoFc9tqFE4',
  },
  {
    name: 'Down to the Beat',
    studentName: 'A',
    studentAgeRange: '11',
    key: 'down_to_the_beat_project',
    channel: 'zDDVcXAaGv-O-wuXn45ba4mZm6uz9wJAyJSsvONN19Y',
  },
  {
    name: 'Bear Bop',
    studentName: 'J',
    studentAgeRange: '8',
    key: 'bear_bop_project',
    channel: '6I9NriNzSu9WPUNqVvCDPXbkQQbb3I_i86h-ZJdR6T8',
  },
  {
    name: 'Friday Night',
    studentName: 'L',
    studentAgeRange: '16',
    key: 'friday_night_project',
    channel: 'kwpnLI1g67W0FbH1PnKbpc5bNUWaWYm_tp_lSinpspA',
  },
].map(project => ({
  type: 'dance',
  thumbnailUrl: `/images/dance-hoc/${project.key}.gif`,
  ...project,
}));

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('student_dance_projects');
  const root = createRoot(container);

  root.render(
    <ProjectCardRow
      galleryType="public"
      showFullThumbnail={true}
      projects={DANCE_PROJECTS}
    />
  );
});

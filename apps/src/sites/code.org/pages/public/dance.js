import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';
import afterPartyProjectImg from '@cdo/static/dance/hoc/after_party_project.gif';
import bearBopProjectImg from '@cdo/static/dance/hoc/bear_bop_project.gif';
import downToTheBeatProjectImg from '@cdo/static/dance/hoc/down_to_the_beat_project.gif';
import fridayNightProjectImg from '@cdo/static/dance/hoc/friday_night_project.gif';

const DANCE_PROJECTS = [
  {
    name: 'After Party',
    studentName: 'M',
    studentAgeRange: '18',
    key: 'after_party_project',
    channel: 'PFutNmyVGt9Nj1pyl_JontH303cOEx6pJpoFc9tqFE4',
    thumbnailUrl: afterPartyProjectImg,
  },
  {
    name: 'Down to the Beat',
    studentName: 'A',
    studentAgeRange: '11',
    key: 'down_to_the_beat_project',
    channel: 'zDDVcXAaGv-O-wuXn45ba4mZm6uz9wJAyJSsvONN19Y',
    thumbnailUrl: downToTheBeatProjectImg,
  },
  {
    name: 'Bear Bop',
    studentName: 'J',
    studentAgeRange: '8',
    key: 'bear_bop_project',
    channel: '6I9NriNzSu9WPUNqVvCDPXbkQQbb3I_i86h-ZJdR6T8',
    thumbnailUrl: bearBopProjectImg,
  },
  {
    name: 'Friday Night',
    studentName: 'L',
    studentAgeRange: '16',
    key: 'friday_night_project',
    channel: 'kwpnLI1g67W0FbH1PnKbpc5bNUWaWYm_tp_lSinpspA',
    thumbnailUrl: fridayNightProjectImg,
  },
].map(project => ({
  type: 'dance',
  ...project,
}));

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('student_dance_projects');
  ReactDOM.render(
    <ProjectCardRow
      galleryType="public"
      showFullThumbnail={true}
      projects={DANCE_PROJECTS}
    />,
    container
  );
});

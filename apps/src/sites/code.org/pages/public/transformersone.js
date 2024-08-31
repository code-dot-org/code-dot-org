import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';

const TRANSFORMERSONE_PROJECTS = [
  {
    name: 'Catch Megatron!',
    key: 'catch_megatron',
    channel: 'KRhjKpvWoPIcDPMmvD91NCm23S9SshJH4JQPVh0zkv8',
  },
  {
    name: 'Alita',
    key: 'alita',
    channel: 'qmgtei5u0nYUl1IOl4-3BmZei7Yf_jc080JwOmx2zMI',
  },
  {
    name: 'Bumblebee',
    key: 'bumblebee',
    channel: '1rlHhoDtD9uqspF9I7HDJvtYoXehzDXheLD0BOCnfdQ',
  },
  {
    name: 'Optimus Prime',
    key: 'optimus_prime',
    channel: '1rlHhoDtD9uqspF9I7HDJtWOewKeCjRIc9QVq-ASZ3E',
  },
].map(project => ({
  type: 'spritelab',
  thumbnailUrl: `/images/transformers/${project.key}.png`,
  ...project,
}));

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('transformersone_student_projects');
  ReactDOM.render(
    <ProjectCardRow
      galleryType="public"
      showFullThumbnail={false}
      projects={TRANSFORMERSONE_PROJECTS}
    />,
    container
  );
});

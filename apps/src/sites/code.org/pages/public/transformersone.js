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
    name: 'Elita',
    key: 'elita',
    channel: '-jyvYo6WibyXD0HbMVfiOAl7H28LnP7_0PXR-Sgf6TE',
  },
  {
    name: 'Click the Cog',
    key: 'click_the_cog',
    channel: '0NalG1oERxEncUaxvibF8ZbccP9tY5qU5Hz7pdGcifA',
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
      showFullThumbnail={true}
      projects={TRANSFORMERSONE_PROJECTS}
    />,
    container
  );
});

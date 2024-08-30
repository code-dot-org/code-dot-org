import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';

const TRANSFORMERSONE_PROJECTS = [
  {
    name: 'Click the Cog',
    key: 'cschelloworld_happyfood2',
    channel: '0NalG1oERxEncUaxvibF8ZbccP9tY5qU5Hz7pdGcifA',
  },
  {
    name: 'Join the Crew',
    key: 'cschelloworld_emoji',
    channel: '9HGWXijqhLzaIIUQbPXlNmWgMO1SXzf3TvMHNtbOXmc',
  },
  {
    name: 'Roll Out',
    key: 'cschelloworld_animals',
    channel: '-jyvYo6WibyXD0HbMVfiOAl7H28LnP7_0PXR-Sgf6TE',
  },
  {
    name: 'Character Lineup',
    key: 'cschelloworld_retro',
    channel: 'rYH8D8eAvWOjuiOpWbHzN7yo2E1S0q87VqlzaBz7oqo',
  },
].map(project => ({
  type: 'spritelab',
  thumbnailUrl: `/images/csc/helloworld/${project.key}.gif`,
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

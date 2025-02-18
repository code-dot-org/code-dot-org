import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';

const HELLOWORLD_PROJECTS = [
  {
    name: 'Food',
    studentName: 'M',
    studentAgeRange: '13+',
    key: 'cschelloworld_happyfood2',
    channel: 'sC_ZiNi_x5GUqsWHE2M4CrcbjU8XvtD3VNT7TM0Y0N8',
  },
  {
    name: 'Emoji',
    studentName: 'D',
    studentAgeRange: '8+',
    key: 'cschelloworld_emoji',
    channel: '9HGWXijqhLzaIIUQbPXlNmWgMO1SXzf3TvMHNtbOXmc',
  },
  {
    name: 'Animals',
    studentName: 'B',
    studentAgeRange: '18+',
    key: 'cschelloworld_animals',
    channel: 'rYH8D8eAvWOjuiOpWbHzN4HAtis4ykKTIjGcNPP9zD4',
  },
  {
    name: 'Retro',
    studentName: 'W',
    studentAgeRange: '13+',
    key: 'cschelloworld_retro',
    channel: 'rYH8D8eAvWOjuiOpWbHzN7yo2E1S0q87VqlzaBz7oqo',
  },
].map(project => ({
  type: 'spritelab',
  thumbnailUrl: `/images/csc/helloworld/${project.key}.gif`,
  ...project,
}));

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('helloworld_student_projects');
  ReactDOM.render(
    <ProjectCardRow
      galleryType="public"
      showFullThumbnail={true}
      projects={HELLOWORLD_PROJECTS}
    />,
    container
  );
});

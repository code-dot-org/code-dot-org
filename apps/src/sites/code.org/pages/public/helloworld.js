import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';
import cschelloworldAnimalsImg from '@cdo/static/csc/helloworld/cschelloworld_animals.gif';
import cschelloworldEmojiImg from '@cdo/static/csc/helloworld/cschelloworld_emoji.gif';
import cschelloworldHappyfood2Img from '@cdo/static/csc/helloworld/cschelloworld_happyfood2.gif';
import cschelloworldRetroImg from '@cdo/static/csc/helloworld/cschelloworld_retro.gif';

const HELLOWORLD_PROJECTS = [
  {
    name: 'Food',
    studentName: 'M',
    studentAgeRange: '13+',
    key: 'cschelloworld_happyfood2',
    channel: 'sC_ZiNi_x5GUqsWHE2M4CrcbjU8XvtD3VNT7TM0Y0N8',
    thumbnailUrl: cschelloworldHappyfood2Img,
  },
  {
    name: 'Emoji',
    studentName: 'D',
    studentAgeRange: '8+',
    key: 'cschelloworld_emoji',
    channel: '9HGWXijqhLzaIIUQbPXlNmWgMO1SXzf3TvMHNtbOXmc',
    thumbnailUrl: cschelloworldEmojiImg,
  },
  {
    name: 'Animals',
    studentName: 'B',
    studentAgeRange: '18+',
    key: 'cschelloworld_animals',
    channel: 'rYH8D8eAvWOjuiOpWbHzN4HAtis4ykKTIjGcNPP9zD4',
    thumbnailUrl: cschelloworldAnimalsImg,
  },
  {
    name: 'Retro',
    studentName: 'W',
    studentAgeRange: '13+',
    key: 'cschelloworld_retro',
    channel: 'rYH8D8eAvWOjuiOpWbHzN7yo2E1S0q87VqlzaBz7oqo',
    thumbnailUrl: cschelloworldRetroImg,
  },
].map(project => ({
  type: 'spritelab',
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

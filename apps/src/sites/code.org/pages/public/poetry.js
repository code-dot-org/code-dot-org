import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';

const POETRY_PROJECTS = [
  {
    name: 'Afternoon',
    studentName: 'M',
    studentAgeRange: '13+',
    key: 'cscpoetry_afternoon',
    channel: 's____JHnjOEbsnZDxh4taek1sSVd-mNVGqjt5dxyx4g',
  },
  {
    name: 'Cloud',
    studentName: 'D',
    studentAgeRange: '8+',
    key: 'cscpoetry_cloud',
    channel: 'LYtB5mpvemKdVlza_kC3AUHSGdVHh_KjWFQfv9mJdw8',
  },
  {
    name: 'Star',
    studentName: 'B',
    studentAgeRange: '18+',
    key: 'cscpoetry_star',
    channel: 'Hg58X9wWRl1vZMh_bVocyS8UULutWk0lZfbK7-o41e4',
  },
  {
    name: 'Sing',
    studentName: 'W',
    studentAgeRange: '13+',
    key: 'cscpoetry_sing',
    channel: 'Hg58X9wWRl1vZMh_bVocye7a3gSe86YxTcGwWjCfOX8',
  },
].map(project => ({
  type: 'poetry_hoc',
  thumbnailUrl: `/images/csc/poetry/${project.key}.gif`,
  ...project,
}));

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('student_poetry_projects');
  ReactDOM.render(
    <ProjectCardRow
      galleryType="public"
      showFullThumbnail={true}
      projects={POETRY_PROJECTS}
    />,
    container
  );
});

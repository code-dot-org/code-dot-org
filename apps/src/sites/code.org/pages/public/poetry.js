import React from 'react';
import ReactDOM from 'react-dom';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';
import cscpoetryAfternoonImg from '@cdo/static/csc/poetry/cscpoetry_afternoon.gif';
import cscpoetryCloudImg from '@cdo/static/csc/poetry/cscpoetry_cloud.gif';
import cscpoetrySingImg from '@cdo/static/csc/poetry/cscpoetry_sing.gif';
import cscpoetryStarImg from '@cdo/static/csc/poetry/cscpoetry_star.gif';

const POETRY_PROJECTS = [
  {
    name: 'Afternoon',
    studentName: 'M',
    studentAgeRange: '13+',
    key: 'cscpoetry_afternoon',
    channel: 's____JHnjOEbsnZDxh4taek1sSVd-mNVGqjt5dxyx4g',
    thumbnailUrl: cscpoetryAfternoonImg,
  },
  {
    name: 'Cloud',
    studentName: 'D',
    studentAgeRange: '8+',
    key: 'cscpoetry_cloud',
    channel: 'LYtB5mpvemKdVlza_kC3AUHSGdVHh_KjWFQfv9mJdw8',
    thumbnailUrl: cscpoetryCloudImg,
  },
  {
    name: 'Star',
    studentName: 'B',
    studentAgeRange: '18+',
    key: 'cscpoetry_star',
    channel: 'Hg58X9wWRl1vZMh_bVocyS8UULutWk0lZfbK7-o41e4',
    thumbnailUrl: cscpoetryStarImg,
  },
  {
    name: 'Sing',
    studentName: 'W',
    studentAgeRange: '13+',
    key: 'cscpoetry_sing',
    channel: 'Hg58X9wWRl1vZMh_bVocye7a3gSe86YxTcGwWjCfOX8',
    thumbnailUrl: cscpoetrySingImg,
  },
].map(project => ({
  type: 'poetry_hoc',
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

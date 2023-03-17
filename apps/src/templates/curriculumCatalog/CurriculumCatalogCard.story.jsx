import React from 'react';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

export default {
  title: 'CurriculumCatalogCard',
  component: CurriculumCatalogCard
};

const Template = args => <CurriculumCatalogCard {...args} />;

export const BaseCard = Template.bind({});
BaseCard.args = {
  courseName: 'Express Course',
  duration: 'Quarter',
  gradeOrAgeRange: 'Grades 4-12',
  imageName: 'another-hoc',
  topic: 'Programming',

  // for screenreaders
  quickViewButtonDescription: 'View more details about the Express Course',
  assignButtonDescription: 'Assign the Express Course'
};
BaseCard.storyName = 'CurriculumCatalogCard – Base';

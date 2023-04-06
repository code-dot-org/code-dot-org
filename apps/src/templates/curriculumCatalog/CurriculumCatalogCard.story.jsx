import React from 'react';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

export default {
  title: 'CurriculumCatalogCard',
  component: CurriculumCatalogCard
};

const Template = args => <CurriculumCatalogCard {...args} />;

const defaultArgs = {
  courseDisplayName: 'AI for Oceans',
  duration: 'quarter',
  youngestGrade: 4,
  oldestGrade: 12,
  subjects: ['english_language_arts'],
  topics: ['cybersecurity'],
  isTranslated: true
};

export const BaseCard = Template.bind({});
BaseCard.args = defaultArgs;
BaseCard.storyName = 'CurriculumCatalogCard – Base';

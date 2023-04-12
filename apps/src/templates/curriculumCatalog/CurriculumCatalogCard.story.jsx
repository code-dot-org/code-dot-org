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
  gradesArray: ['1', '2', '3', '4'],
  subjects: ['math'],
  topics: ['programming', 'artificial_intelligence', 'art_and_design'],
  isTranslated: true,
  isEnglish: true
};

export const BaseCard = Template.bind({});
BaseCard.args = defaultArgs;
BaseCard.storyName = 'CurriculumCatalogCard – Base';

export const NonEnglishCard = Template.bind({});
NonEnglishCard.args = {...defaultArgs, isEnglish: false};
NonEnglishCard.storyName = 'CurriculumCatalogCard – Not English Format';

export const OneGradeCard = Template.bind({});
OneGradeCard.args = {...defaultArgs, gradesArray: ['K']};
OneGradeCard.storyName = 'CurriculumCatalogCard – One Grade';

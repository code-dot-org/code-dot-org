import React from 'react';
import {Provider} from 'react-redux';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {configureStore} from '@reduxjs/toolkit';

export default {
  title: 'CurriculumCatalogCard',
  component: CurriculumCatalogCard,
};

const Template = args => (
  <Provider store={configureStore({reducer: {teacherSections}})}>
    <CurriculumCatalogCard {...args} />
  </Provider>
);

const defaultArgs = {
  courseDisplayName: 'Computer Science Principles',
  courseDisplayNameWithLatestYear: 'Computer Science Principles (22-23)',
  duration: 'school_year',
  gradesArray: ['1', '2', '3', '4'],
  topics: ['programming', 'artificial_intelligence', 'art_and_design'],
  isTranslated: true,
  isEnglish: true,
  pathToCourse: '/s/course',
  isSignedOut: false,
};

export const AllOptionsCard = Template.bind({});
AllOptionsCard.args = defaultArgs;
AllOptionsCard.storyName = 'CurriculumCatalogCard – All Options';

export const NotTranslatedCard = Template.bind({});
NotTranslatedCard.args = {...defaultArgs, isTranslated: false};
NotTranslatedCard.storyName = 'CurriculumCatalogCard – Not Translated';

export const NonEnglishCard = Template.bind({});
NonEnglishCard.args = {...defaultArgs, isEnglish: false};
NonEnglishCard.storyName = 'CurriculumCatalogCard – Not English Format';

export const OneGradeCard = Template.bind({});
OneGradeCard.args = {...defaultArgs, gradesArray: ['K']};
OneGradeCard.storyName = 'CurriculumCatalogCard – One Grade';

export const NoLabelsCard = Template.bind({});
NoLabelsCard.args = {...defaultArgs, topics: []};
NoLabelsCard.storyName = 'CurriculumCatalogCard – No Labels';

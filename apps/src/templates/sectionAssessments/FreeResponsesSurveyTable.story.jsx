import React from 'react';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';

const surveyOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'Row Row Row your boat',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: 'Gently down the stream'
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'Merrily merrily merrily',
  },
  {
    id: 4,
    studentId: '213',
    name: 'Brendan',
    response: 'Life is but a dream',
  },
  {
    id: 5,
    studentId: '214',
    name: 'Dave',
    response: 'Ta da',
  },

];

const surveyTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'In every walk with nature, one receives far more than one seeks',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Dave',
    response: 'In every walk with nature, one receives far more than one seeks',
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'In every walk with nature, one receives far more than one seeks',
  },
];


export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesSurveyTable', module)
    .addStoryTable([
      {
        name: 'Free responses for survey 1',
        description: 'Display anonymous responses',
        story: () => (
          <FreeResponsesSurveyTable
            freeResponses={surveyOne}
          />
        )
      },
      {
        name: 'Free responses for survey 2',
        description: 'Table not displayed if less than 5 surveys are submitted',
        story: () => (
          <FreeResponsesSurveyTable
            freeResponses={surveyTwo}
          />
        )
      },
    ]);

};

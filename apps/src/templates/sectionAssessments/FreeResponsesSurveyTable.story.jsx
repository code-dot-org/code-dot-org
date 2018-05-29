import React from 'react';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';

const surveyOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'Sea lettuce gumbo grape kale kombu cauliflower salsify kohlrabi okra sea lettuce broccoli celery lotus root carrot winter purslane turnip greens garlic.',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: 'Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato.'
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'Pea horseradish azuki bean lettuce avocado asparagus okra. Kohlrabi radish okra azuki bean corn fava bean mustard tigernut jícama green bean celtuce collard greens avocado quandong fennel gumbo black-eyed pea.',
  },
  {
    id: 4,
    studentId: '213',
    name: 'Brendan',
    response: 'Celery quandong swiss chard chicory earthnut pea potato. Salsify taro catsear garlic gram celery bitterleaf wattle seed collard greens nori.',
  },
  {
    id: 5,
    studentId: '214',
    name: 'Dave',
    response: 'Turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale.',
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

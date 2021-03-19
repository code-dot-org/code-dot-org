import React from 'react';
import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';

const defaultVocabProps = {
  objectToRollUp: 'Vocabulary',
  units: [
    {
      key: 'unit-1',
      displayName: 'Unit 1 - Unit One',
      lessons: [
        {
          key: 'l1',
          position: 1,
          displayName: 'Lesson One',
          vocabularies: [
            {
              key: 'key',
              word: 'word',
              definition: 'definition'
            }
          ]
        },
        {
          key: 'l2',
          position: 2,
          displayName: 'Lesson Two',
          vocabularies: [
            {
              key: 'key',
              word: 'word',
              definition: 'definition'
            }
          ]
        }
      ]
    },
    {
      key: 'unit-2',
      displayName: 'Unit 2 - Unit Two',
      lessons: [
        {
          key: 'l3',
          position: 3,
          displayName: 'Lesson Three',
          vocabularies: [
            {
              key: 'key',
              word: 'word',
              definition: 'definition'
            }
          ]
        },
        {
          key: 'l4',
          position: 4,
          displayName: 'Lesson Four',
          vocabularies: [
            {
              key: 'key',
              word: 'word',
              definition: 'definition'
            }
          ]
        }
      ]
    }
  ]
};

const defaultCodeProps = {
  objectToRollUp: 'Code',
  units: [
    {
      key: 'unit-1',
      displayName: 'Unit 1 - Unit One',
      lessons: [
        {
          key: 'l1',
          position: 1,
          displayName: 'Lesson One',
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ]
        },
        {
          key: 'l2',
          position: 2,
          displayName: 'Lesson Two',
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ]
        }
      ]
    },
    {
      key: 'unit-2',
      displayName: 'Unit 2 - Unit Two',
      lessons: [
        {
          key: 'l3',
          position: 3,
          displayName: 'Lesson Three',
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ]
        },
        {
          key: 'l4',
          position: 4,
          displayName: 'Lesson Four',
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ]
        }
      ]
    }
  ]
};

export default storybook => {
  storybook.storiesOf('CourseRollup', module).addStoryTable([
    {
      name: 'Course Vocabulary',
      story: () => <CourseRollup {...defaultVocabProps} />
    },
    {
      name: 'Course Code',
      story: () => <CourseRollup {...defaultCodeProps} />
    }
  ]);
};

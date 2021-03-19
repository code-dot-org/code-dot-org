import React from 'react';
import CourseVocab from '@cdo/apps/templates/courseRollupPages/CourseVocab';

const defaultProps = {
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

export default storybook => {
  storybook.storiesOf('CourseVocab', module).addStoryTable([
    {
      name: 'CourseVocab',
      story: () => <CourseVocab {...defaultProps} />
    }
  ]);
};

import React from 'react';
import CourseVocab from '@cdo/apps/templates/courseRollupPages/CourseVocab';

const defaultProps = {
  units: [
    {
      displayName: 'Unit 1 - Unit One',
      lessons: [
        {
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
      displayName: 'Unit 2 - Unit Two',
      lessons: [
        {
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

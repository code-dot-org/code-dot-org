import React from 'react';
import LessonStandards from './LessonStandards';

export default storybook => {
  storybook.storiesOf('LessonStandards', module).addStoryTable([
    {
      name: 'LessonStandards with parent category',
      story: () => (
        <LessonStandards
          standards={[
            {
              frameworkName: 'Next Generation Science Standards',
              parentCategoryShortcode: 'ESS',
              parentCategoryDescription: 'Earth and Space Science',
              categoryShortcode: 'ESS1',
              categoryDescription: "Earth's Place in the Universe",
              shortcode: '1-ESS1-1',
              description:
                'Use observations of the sun, moon, and stars to describe patterns that can be predicted.'
            }
          ]}
        />
      )
    },
    {
      name: 'LessonStandards without parent category',
      story: () => (
        <LessonStandards
          standards={[
            {
              frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
              categoryShortcode: 'AP',
              categoryDescription: 'Algorithms & Programming',
              shortcode: '1B-AP-09',
              description:
                'Create programs that use variables to store and modify data.'
            }
          ]}
        />
      )
    }
  ]);
};

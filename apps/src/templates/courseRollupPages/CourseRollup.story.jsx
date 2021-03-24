import React from 'react';
import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';

const defaultProps = {
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
          ],
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ],
          preparation: '- One',
          resources: {
            Teacher: [
              {
                key: 'teacher-resource',
                name: 'Teacher Resource',
                url: 'fake.url',
                type: 'Slides'
              }
            ],
            Student: [
              {
                key: 'student-resource',
                name: 'Student Resource',
                url: 'fake.url',
                download_url: 'download.fake.url',
                type: 'Activity Guide'
              }
            ]
          }
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
          ],
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ],
          preparation: '- One',
          resources: {
            Teacher: [
              {
                key: 'teacher-resource',
                name: 'Teacher Resource',
                url: 'fake.url',
                type: 'Slides'
              }
            ],
            Student: [
              {
                key: 'student-resource',
                name: 'Student Resource',
                url: 'fake.url',
                download_url: 'download.fake.url',
                type: 'Activity Guide'
              }
            ]
          }
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
          vocabularies: [],
          programmingExpressions: [],
          preparation: null,
          resources: {}
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
          ],
          programmingExpressions: [
            {
              name: 'playSound',
              link: 'studio.code.org/docs/applab/playSound'
            }
          ],
          preparation: '- One',
          resources: {
            Teacher: [
              {
                key: 'teacher-resource',
                name: 'Teacher Resource',
                url: 'fake.url',
                type: 'Slides'
              }
            ],
            Student: [
              {
                key: 'student-resource',
                name: 'Student Resource',
                url: 'fake.url',
                download_url: 'download.fake.url',
                type: 'Activity Guide'
              }
            ]
          }
        }
      ]
    }
  ]
};

export default storybook => {
  storybook
    .storiesOf('CourseRollup', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Course Vocabulary',
        story: () => <CourseRollup {...defaultProps} />
      },
      {
        name: 'Course Code',
        story: () => <CourseRollup {...defaultProps} objectToRollUp={'Code'} />
      },
      {
        name: 'Course Resources',
        story: () => (
          <CourseRollup {...defaultProps} objectToRollUp={'Resources'} />
        )
      },
      {
        name: 'Unit Vocabulary',
        story: () => (
          <UnitRollup
            unit={defaultProps.units[0]}
            objectToRollUp={defaultProps.objectToRollUp}
          />
        )
      },
      {
        name: 'Unit Code',
        story: () => (
          <UnitRollup unit={defaultProps.units[0]} objectToRollUp={'Code'} />
        )
      },
      {
        name: 'Unit Resources',
        story: () => (
          <UnitRollup
            unit={defaultProps.units[0]}
            objectToRollUp={'Resources'}
          />
        )
      }
    ]);
};

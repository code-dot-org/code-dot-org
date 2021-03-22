import React from 'react';
import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';

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

const defaultResourceProps = {
  objectToRollUp: 'Resources',
  units: [
    {
      key: 'unit-1',
      displayName: 'Unit 1 - Unit One',
      lessons: [
        {
          key: 'l1',
          position: 1,
          displayName: 'Lesson One',
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
          key: 'l4',
          position: 4,
          displayName: 'Lesson Four',
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
  storybook.storiesOf('CourseRollup', module).addStoryTable([
    {
      name: 'Course Vocabulary',
      story: () => <CourseRollup {...defaultVocabProps} />
    },
    {
      name: 'Course Code',
      story: () => <CourseRollup {...defaultCodeProps} />
    },
    {
      name: 'Course Resources',
      story: () => <CourseRollup {...defaultResourceProps} />
    },
    {
      name: 'Unit Vocabulary',
      story: () => (
        <UnitRollup
          unit={defaultVocabProps.units[0]}
          objectToRollUp={defaultVocabProps.objectToRollUp}
        />
      )
    },
    {
      name: 'Unit Code',
      story: () => (
        <UnitRollup
          unit={defaultCodeProps.units[0]}
          objectToRollUp={defaultCodeProps.objectToRollUp}
        />
      )
    },
    {
      name: 'Unit Resources',
      story: () => (
        <UnitRollup
          unit={defaultResourceProps.units[0]}
          objectToRollUp={defaultResourceProps.objectToRollUp}
        />
      )
    }
  ]);
};

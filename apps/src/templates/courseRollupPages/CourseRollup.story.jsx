import React from 'react';
import {Provider} from 'react-redux';

import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';
import {reduxStore} from '@cdo/storybook/decorators';

const defaultProps = {
  objectToRollUp: 'Vocabulary',
  course: {
    title: 'My Course',
    link: '/courses/my-course',
    units: [
      {
        name: 'unit-1',
        link: '/s/unit-1',
        title: 'Unit 1 - Unit One',
        lessons: [
          {
            key: 'l1',
            link: '/s/unit-1/lessons/1',
            position: 1,
            displayName: 'Lesson One',
            vocabularies: [
              {
                key: 'key',
                word: 'word',
                definition: 'definition',
              },
            ],
            programmingExpressions: [
              {
                syntax: 'playSound',
                name: 'playSound',
                link: 'studio.code.org/docs/applab/playSound',
              },
            ],
            preparation: '- One',
            standards: [
              {
                frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
                parentCategoryShortcode: null,
                parentCategoryDescription: null,
                categoryShortcode: 'AP',
                categoryDescription: 'Algorithms & Programming',
                shortcode: '1B-AP-09',
                description:
                  'Create programs that use variables to store and modify data.',
              },
            ],
            resources: {
              Teacher: [
                {
                  key: 'teacher-resource',
                  name: 'Teacher Resource',
                  url: 'fake.url',
                  type: 'Slides',
                },
              ],
              Student: [
                {
                  key: 'student-resource',
                  name: 'Student Resource',
                  url: 'fake.url',
                  download_url: 'download.fake.url',
                  type: 'Activity Guide',
                },
              ],
            },
          },
          {
            key: 'l2',
            position: 2,
            displayName: 'Lesson Two',
            link: '/s/unit-1/lessons/2',
            vocabularies: [
              {
                key: 'key',
                word: 'word',
                definition: 'definition',
              },
            ],
            programmingExpressions: [
              {
                syntax: 'playSound',
                name: 'playSound',
                link: 'studio.code.org/docs/applab/playSound',
              },
            ],
            preparation: '- One',
            standards: [
              {
                frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
                parentCategoryShortcode: null,
                parentCategoryDescription: null,
                categoryShortcode: 'AP',
                categoryDescription: 'Algorithms & Programming',
                shortcode: '1B-AP-09',
                description:
                  'Create programs that use variables to store and modify data.',
              },
            ],
            resources: {
              Teacher: [
                {
                  key: 'teacher-resource',
                  name: 'Teacher Resource',
                  url: 'fake.url',
                  type: 'Slides',
                },
              ],
              Student: [
                {
                  key: 'student-resource',
                  name: 'Student Resource',
                  url: 'fake.url',
                  download_url: 'download.fake.url',
                  type: 'Activity Guide',
                },
              ],
            },
          },
        ],
      },
      {
        name: 'unit-2',
        link: '/s/unit-2',
        title: 'Unit 2 - Unit Two',
        lessons: [
          {
            key: 'l3',
            position: 1,
            link: '/s/unit-2/lessons/1',
            displayName: 'Lesson One',
            vocabularies: [],
            standards: [],
            programmingExpressions: [],
            preparation: null,
            resources: {},
          },
          {
            key: 'l4',
            position: 2,
            displayName: 'Lesson Two',
            link: '/s/unit-2/lessons/2',
            vocabularies: [
              {
                key: 'key',
                word: 'word',
                definition: 'definition',
              },
            ],
            programmingExpressions: [
              {
                syntax: 'playSound',
                name: 'playSound',
                link: 'studio.code.org/docs/applab/playSound',
              },
            ],
            preparation: '- One',
            standards: [
              {
                frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
                parentCategoryShortcode: null,
                parentCategoryDescription: null,
                categoryShortcode: 'AP',
                categoryDescription: 'Algorithms & Programming',
                shortcode: '1B-AP-09',
                description:
                  'Create programs that use variables to store and modify data.',
              },
            ],
            resources: {
              Teacher: [
                {
                  key: 'teacher-resource',
                  name: 'Teacher Resource',
                  url: 'fake.url',
                  type: 'Slides',
                },
              ],
              Student: [
                {
                  key: 'student-resource',
                  name: 'Student Resource',
                  url: 'fake.url',
                  download_url: 'download.fake.url',
                  type: 'Activity Guide',
                },
              ],
            },
          },
        ],
      },
    ],
  },
};

export default {
  component: CourseRollup,
};

const CourseTemplate = args => {
  return (
    <Provider store={reduxStore()}>
      <CourseRollup {...defaultProps} {...args} />
    </Provider>
  );
};

const UnitTemplate = args => {
  return (
    <Provider store={reduxStore()}>
      <UnitRollup unit={defaultProps.course.units[0]} {...args} />
    </Provider>
  );
};

export const CourseVocabularyExample = CourseTemplate.bind({});
CourseVocabularyExample.args = {
  objectToRollUp: defaultProps.objectToRollUp,
};

export const CourseCodeExample = CourseTemplate.bind({});
CourseCodeExample.args = {
  objectToRollUp: 'Code',
};

export const CourseResourceExample = CourseTemplate.bind({});
CourseResourceExample.args = {
  objectToRollUp: 'Resources',
};

export const CourseStandardsExample = CourseTemplate.bind({});
CourseStandardsExample.args = {
  objectToRollUp: 'Standards',
};

export const UnitVocabularyExample = UnitTemplate.bind({});
UnitVocabularyExample.args = {
  objectToRollUp: defaultProps.objectToRollUp,
};

export const UnitCodeExample = UnitTemplate.bind({});
UnitCodeExample.args = {
  objectToRollUp: 'Code',
};

export const UnitResourceExample = UnitTemplate.bind({});
UnitResourceExample.args = {
  objectToRollUp: 'Resources',
};

export const UnitStandardsExample = UnitTemplate.bind({});
UnitStandardsExample.args = {
  objectToRollUp: 'Standards',
};

export const courseData = {
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
          standards: [
            {
              frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
              parentCategoryShortcode: null,
              parentCategoryDescription: null,
              categoryShortcode: 'AP',
              categoryDescription: 'Algorithms & Programming',
              shortcode: '1B-AP-09',
              description:
                'Create programs that use variables to store and modify data.'
            }
          ],
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
          link: '/s/unit-1/lessons/2',
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
          standards: [
            {
              frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
              parentCategoryShortcode: null,
              parentCategoryDescription: null,
              categoryShortcode: 'AP',
              categoryDescription: 'Algorithms & Programming',
              shortcode: '1B-AP-09',
              description:
                'Create programs that use variables to store and modify data.'
            }
          ],
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
          programmingExpressions: [],
          standards: [],
          preparation: null,
          resources: {}
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
          standards: [
            {
              frameworkName: 'CSTA K-12 Computer Science Standards (2017)',
              parentCategoryShortcode: null,
              parentCategoryDescription: null,
              categoryShortcode: 'AP',
              categoryDescription: 'Algorithms & Programming',
              shortcode: '1B-AP-09',
              description:
                'Create programs that use variables to store and modify data.'
            }
          ],
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

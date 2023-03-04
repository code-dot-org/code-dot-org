// Use this for simple, singular course testing
export const elementarySchoolCourseOffering = {
  elementary: {
    Course: {
      'CS Fundamentals': [{id: 19, key: 'coursea', display_name: 'Course A'}]
    }
  }
};

// Use this sample to test multiple headings, course versions, etc
export const highSchoolCourseOfferings = {
  high: {
    Course: {
      'Year Long': [
        {
          id: 73,
          key: 'csa',
          display_name: 'Computer Science A',
          course_versions: [
            {
              id: 726,
              key: '2022',
              version_year: "'22-'23",
              name: "Computer Science A ('22-'23)",
              path: '/courses/csa-2022',
              type: 'UnitGroup',
              is_stable: true,
              is_recommended: true,
              locales: ['English']
            }
          ]
        },
        {
          id: 74,
          key: 'csd',
          display_name: 'Computer Science Discoveries',
          course_versions: [
            {
              id: 732,
              key: '2017',
              version_year: "'17-'18",
              name: "Computer Science Discoveries ('17-'18)",
              path: '/courses/csd-2017',
              type: 'UnitGroup',
              is_stable: true,
              is_recommended: false,
              locales: ['English']
            }
          ]
        },
        {
          id: 75,
          key: 'csp',
          display_name: 'Computer Science Principles',
          course_versions: [
            {
              id: 738,
              key: '2017',
              version_year: "'17-'18",
              name: "Computer Science Principles ('17-'18)",
              path: '/courses/csp-2017',
              type: 'UnitGroup',
              is_stable: true,
              is_recommended: false,
              locales: ['English']
            },
            {
              id: 740,
              key: '2019',
              version_year: "'19-'20",
              name: "Computer Science Principles ('19-'20)",
              path: '/courses/csp-2019',
              type: 'UnitGroup',
              is_stable: true,
              is_recommended: false,
              locales: ['English']
            }
          ]
        }
      ]
    },
    'Standalone Unit': {
      'CSA Labs': [
        {
          id: 381,
          key: 'csa-collegeboard-labs',
          display_name: 'AP CSA Magpie Lab',
          course_versions: [
            {
              id: 891,
              key: 'unversioned',
              version_year: 'unversioned',
              name: 'AP CSA Magpie Lab',
              path: '/s/csa-magpie-lab',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English']
            }
          ]
        }
      ],
      'Teacher-Led': [
        {
          id: 5,
          key: 'aiml',
          display_name: 'AI and Machine Learning Module',
          course_versions: [
            {
              id: 798,
              key: '2021',
              version_year: '2021',
              name: 'AI and Machine Learning Module',
              path: '/s/aiml-2021',
              type: 'Unit',
              is_stable: true,
              is_recommended: false,
              locales: ['English']
            }
          ]
        }
      ]
    }
  }
};

// Keeping 4 categories to be able to test the uneven split of headers
export const hocCourseOfferings = {
  hoc: {
    Favorites: [
      {
        id: 55,
        key: 'oceans',
        display_name: 'AI for Oceans',
        course_versions: [
          {
            id: 1072,
            key: 'unversioned',
            version_year: 'unversioned',
            name: 'AI for Oceans',
            path: '/s/oceans',
            type: 'Unit',
            is_stable: true,
            is_recommended: true,
            locales: ['English']
          }
        ]
      },
      {
        id: 60,
        key: 'poem-art',
        display_name: 'Poem Art',
        course_versions: [
          {
            id: 1086,
            key: '2021',
            version_year: '2021',
            name: 'Poem Art',
            path: '/s/poem-art-2021',
            type: 'Unit',
            is_stable: true,
            is_recommended: true,
            locales: ['English']
          }
        ]
      }
    ],
    'Hello World': [
      {
        id: 43,
        key: 'hello-world-animals',
        display_name: 'Hello World: Animals',
        course_versions: [
          {
            id: 1033,
            key: '2021',
            version_year: '2021',
            name: 'Hello World: Animals',
            path: '/s/hello-world-animals-2021',
            type: 'Unit',
            is_stable: true,
            is_recommended: true,
            locales: ['English']
          }
        ]
      }
    ],
    'Labs and Skills': [
      {
        id: 48,
        key: 'hoc-encryption',
        display_name: 'Hour of Code: Simple Encryption',
        course_versions: [
          {
            id: 1043,
            key: 'unversioned',
            version_year: 'unversioned',
            name: 'Hour of Code: Simple Encryption',
            path: '/s/hoc-encryption',
            type: 'Unit',
            is_stable: true,
            is_recommended: true,
            locales: ['English']
          }
        ]
      }
    ],
    'Popular Media': [
      {
        id: 69,
        key: 'starwars',
        display_name: 'Star Wars: Building a Galaxy With Code (Javascript)',
        course_versions: [
          {
            id: 1120,
            key: 'unversioned',
            version_year: 'unversioned',
            name: 'Star Wars: Building a Galaxy With Code (Javascript)',
            path: '/s/starwars',
            type: 'Unit',
            is_stable: true,
            is_recommended: true,
            locales: ['English']
          }
        ]
      }
    ]
  }
};

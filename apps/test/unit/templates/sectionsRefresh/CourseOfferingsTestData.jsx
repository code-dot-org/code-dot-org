// Use this for simple, singular course testing
export const elementarySchoolCourseOffering = {
  elementary: {
    Course: {
      'CS Fundamentals': [{id: 19, key: 'coursea', display_name: 'Course A'}],
    },
  },
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
            [
              726,
              {
                id: 726,
                key: '2022',
                version_year: "'22-'23",
                content_root_id: 48,
                name: "Computer Science A ('22-'23)",
                path: '/courses/csa-2022',
                type: 'UnitGroup',
                is_stable: true,
                is_recommended: true,
                locales: ['English'],
                units: {
                  3159: {
                    id: 3159,
                    name: "Object-Oriented Programming ('22-'23)",
                    path: '/s/csa1-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 1,
                    requires_verified_instructor: true,
                  },
                  3167: {
                    id: 3167,
                    name: "Arrays and Algorithms ('22-'23)",
                    path: '/s/csa3-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 3,
                    requires_verified_instructor: true,
                  },
                  5341: {
                    id: 5341,
                    name: "AP Exam Review and Practice ('22-'23)",
                    path: '/s/csa9-2022',
                    lesson_extras_available: true,
                    text_to_speech_enabled: true,
                    position: 9,
                    requires_verified_instructor: true,
                  },
                },
              },
            ],
          ],
        },
        {
          id: 74,
          key: 'csd',
          display_name: 'Computer Science Discoveries',
          course_versions: [
            [
              736,
              {
                id: 736,
                key: '2021',
                version_year: "'21-'22",
                content_root_id: 36,
                name: "Computer Science Discoveries ('21-'22)",
                path: '/courses/csd-2021',
                type: 'UnitGroup',
                is_stable: true,
                is_recommended: false,
                locales: ['English'],
                units: {
                  182: {
                    id: 182,
                    name: "Problem Solving and Computing ('21-'22)",
                    path: '/s/csd1-2021',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 1,
                    requires_verified_instructor: false,
                  },
                  190: {
                    id: 190,
                    name: "Web Development ('21-'22)",
                    path: '/s/csd2-2021',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 2,
                    requires_verified_instructor: false,
                  },
                },
              },
            ],
            [
              737,
              {
                id: 737,
                key: '2022',
                version_year: "'22-'23",
                content_root_id: 55,
                name: "Computer Science Discoveries ('22-'23)",
                path: '/courses/csd-2022',
                type: 'UnitGroup',
                is_stable: true,
                is_recommended: true,
                locales: ['English'],
                units: {
                  5080: {
                    id: 5080,
                    name: "Problem Solving and Computing ('22-'23)",
                    path: '/s/csd1-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 1,
                    requires_verified_instructor: false,
                  },
                  5089: {
                    id: 5089,
                    name: "Web Development ('22-'23)",
                    path: '/s/csd2-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 2,
                    requires_verified_instructor: false,
                  },
                },
              },
            ],
          ],
        },
      ],
    },
    'Standalone Unit': {
      'Teacher-Led': [
        {
          id: 5,
          key: 'aiml',
          display_name: 'AI and Machine Learning Module',
          course_versions: [
            [
              798,
              {
                id: 798,
                key: '2021',
                version_year: '2021',
                content_root_id: 49,
                name: 'AI and Machine Learning Module',
                path: '/s/aiml-2021',
                type: 'Unit',
                is_stable: true,
                is_recommended: false,
                locales: ['English'],
                units: {
                  49: {
                    id: 49,
                    name: 'AI and Machine Learning Module',
                    path: '/s/aiml-2021',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: null,
                    requires_verified_instructor: false,
                  },
                },
              },
            ],
            [
              799,
              {
                id: 799,
                key: '2022',
                version_year: '2022',
                content_root_id: 5191,
                name: 'AI and Machine Learning Module',
                path: '/s/aiml-2022',
                type: 'Unit',
                is_stable: true,
                is_recommended: true,
                locales: ['English'],
                units: {
                  5191: {
                    id: 5191,
                    name: 'AI and Machine Learning Module',
                    path: '/s/aiml-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: null,
                    requires_verified_instructor: false,
                  },
                },
              },
            ],
          ],
        },
        {
          id: 407,
          key: 'devices',
          display_name: 'Creating Apps for Devices',
          course_versions: [
            [
              1163,
              {
                id: 1163,
                key: '2022',
                version_year: '2022',
                content_root_id: 12097,
                name: 'Creating Apps for Devices',
                path: '/s/devices-2022',
                type: 'Unit',
                is_stable: true,
                is_recommended: true,
                locales: ['English'],
                units: {
                  12097: {
                    id: 12097,
                    name: 'Creating Apps for Devices',
                    path: '/s/devices-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: null,
                    requires_verified_instructor: false,
                  },
                },
              },
            ],
          ],
        },
      ],
    },
  },
};

// Keeping 5 categories to be able to test the uneven split of headers
export const hocCourseOfferings = {
  hoc: {
    Favorites: [
      {
        id: 55,
        key: 'oceans',
        display_name: 'AI for Oceans',
        course_versions: [
          [
            1072,
            {
              id: 1072,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 451,
              name: 'AI for Oceans',
              path: '/s/oceans',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                451: {
                  id: 451,
                  name: 'AI for Oceans',
                  path: '/s/oceans',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 31,
        key: 'dance-2019',
        display_name: 'Dance Party (2019)',
        course_versions: [
          [
            986,
            {
              id: 986,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 344,
              name: 'Dance Party',
              path: '/s/dance-2019',
              type: 'Unit',
              is_stable: false,
              is_recommended: false,
              locales: ['English'],
              units: {
                344: {
                  id: 344,
                  name: 'Dance Party',
                  path: '/s/dance-2019',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 57,
        key: 'outbreak',
        display_name: 'Outbreak Simulator',
        course_versions: [
          [
            1076,
            {
              id: 1076,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 455,
              name: 'Outbreak Simulator',
              path: '/s/outbreak',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                455: {
                  id: 455,
                  name: 'Outbreak Simulator',
                  path: '/s/outbreak',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 60,
        key: 'poem-art',
        display_name: 'Poem Art',
        course_versions: [
          [
            1086,
            {
              id: 1086,
              key: '2021',
              version_year: '2021',
              content_root_id: 1161,
              name: 'Poem Art',
              path: '/s/poem-art-2021',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                1161: {
                  id: 1161,
                  name: 'Poem Art',
                  path: '/s/poem-art-2021',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
    'Hello World': [
      {
        id: 43,
        key: 'hello-world-animals',
        display_name: 'Hello World: Animals',
        course_versions: [
          [
            1033,
            {
              id: 1033,
              key: '2021',
              version_year: '2021',
              content_root_id: 1110,
              name: 'Hello World: Animals',
              path: '/s/hello-world-animals-2021',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                1110: {
                  id: 1110,
                  name: 'Hello World: Animals',
                  path: '/s/hello-world-animals-2021',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 46,
        key: 'hello-world-retro',
        display_name: 'Hello World: Retro',
        course_versions: [
          [
            1039,
            {
              id: 1039,
              key: '2021',
              version_year: '2021',
              content_root_id: 1118,
              name: 'Hello World: Retro',
              path: '/s/hello-world-retro-2021',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                1118: {
                  id: 1118,
                  name: 'Hello World: Retro',
                  path: '/s/hello-world-retro-2021',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 379,
        key: 'hello-world-soccer',
        display_name: 'Hello World: Soccer',
        course_versions: [
          [
            1040,
            {
              id: 1040,
              key: '2022',
              version_year: '2022',
              content_root_id: 8609,
              name: 'Hello World: Soccer',
              path: '/s/hello-world-soccer-2022',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                8609: {
                  id: 8609,
                  name: 'Hello World: Soccer',
                  path: '/s/hello-world-soccer-2022',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
    'Labs and Skills': [
      {
        id: 48,
        key: 'hoc-encryption',
        display_name: 'Hour of Code: Simple Encryption',
        course_versions: [
          [
            1043,
            {
              id: 1043,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 424,
              name: 'Hour of Code: Simple Encryption',
              path: '/s/hoc-encryption',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                424: {
                  id: 424,
                  name: 'Hour of Code: Simple Encryption',
                  path: '/s/hoc-encryption',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 8,
        key: 'applab-intro',
        display_name: 'Intro to App Lab',
        course_versions: [
          [
            811,
            {
              id: 811,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 76,
              name: 'Intro to App Lab',
              path: '/s/applab-intro',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                76: {
                  id: 76,
                  name: 'Intro to App Lab',
                  path: '/s/applab-intro',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
    'Popular Media': [
      {
        id: 70,
        key: 'starwarsblocks',
        display_name: 'Star Wars: Building a Galaxy With Code (Blockly)',
        course_versions: [
          [
            1121,
            {
              id: 1121,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 527,
              name: 'Star Wars: Building a Galaxy With Code (Blockly)',
              path: '/s/starwarsblocks',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                527: {
                  id: 527,
                  name: 'Star Wars: Building a Galaxy With Code (Blockly)',
                  path: '/s/starwarsblocks',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
    Sports: [
      {
        id: 11,
        key: 'basketball',
        display_name: 'Choose your team and make a basketball game',
        course_versions: [
          [
            819,
            {
              id: 819,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 84,
              name: 'Choose your team and make a basketball game',
              path: '/s/basketball',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                84: {
                  id: 84,
                  name: 'Choose your team and make a basketball game',
                  path: '/s/basketball',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 68,
        key: 'sports',
        display_name: 'Code your own sports game',
        course_versions: [
          [
            1115,
            {
              id: 1115,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 520,
              name: 'Code your own sports game',
              path: '/s/sports',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                520: {
                  id: 520,
                  name: 'Code your own sports game',
                  path: '/s/sports',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 33,
        key: 'dance-extras',
        display_name: 'Keep On Dancing (2018)',
        course_versions: [
          [
            990,
            {
              id: 990,
              key: 'unversioned',
              version_year: 'unversioned',
              content_root_id: 348,
              name: 'Keep On Dancing (2018)',
              path: '/s/dance-extras',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                348: {
                  id: 348,
                  name: 'Keep On Dancing (2018)',
                  path: '/s/dance-extras',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
  },
};

export const plCourseOfferings = {
  pl: {
    '6–12 Virtual Academic Year Workshops': [
      {
        id: 92,
        key: 'vpl-csd',
        display_name: 'CS Discoveries Virtual Professional Learning',
        course_versions: [
          [
            1143,
            {
              id: 1143,
              key: '2022',
              version_year: '2022',
              content_root_id: 7343,
              name: 'CS Discoveries Virtual Professional Learning 2022 - 23',
              path: '/s/vpl-csd-2022',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                7343: {
                  id: 7343,
                  name: 'CS Discoveries Virtual Professional Learning 2022 - 23',
                  path: '/s/vpl-csd-2022',
                  lesson_extras_available: false,
                  text_to_speech_enabled: true,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
      {
        id: 362,
        key: 'vpl-csa',
        display_name: 'CSA Virtual Professional Learning',
        course_versions: [
          [
            1140,
            {
              id: 1140,
              key: '2022',
              version_year: '2022',
              content_root_id: 7340,
              name: 'CSA Virtual Professional Learning',
              path: '/s/vpl-csa-2022',
              type: 'Unit',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                7340: {
                  id: 7340,
                  name: 'CSA Virtual Professional Learning',
                  path: '/s/vpl-csa-2022',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: null,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
    'Self-Paced': [
      {
        id: 106,
        key: 'self-paced-pl-csa',
        display_name: 'CSA Getting Started Modules',
        course_versions: [
          [
            745,
            {
              id: 745,
              key: '2022',
              version_year: "'22-'23",
              content_root_id: 52,
              name: 'CSA Getting Started Modules',
              path: '/courses/self-paced-pl-csa-2022',
              type: 'UnitGroup',
              is_stable: true,
              is_recommended: true,
              locales: ['English'],
              units: {
                4162: {
                  id: 4162,
                  name: 'Module 1: Welcome',
                  path: '/s/self-paced-pl-csa1-2022',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: 1,
                  requires_verified_instructor: false,
                },
                4163: {
                  id: 4163,
                  name: 'Module 2: Navigating Code.org',
                  path: '/s/self-paced-pl-csa2-2022',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: 2,
                  requires_verified_instructor: false,
                },
                4164: {
                  id: 4164,
                  name: 'Module 3: Support for text-based programming',
                  path: '/s/self-paced-pl-csa3-2022',
                  lesson_extras_available: false,
                  text_to_speech_enabled: false,
                  position: 3,
                  requires_verified_instructor: false,
                },
              },
            },
          ],
        ],
      },
    ],
  },
};

export const noRecommendedVersionsOfferings = {
  high: {
    Course: {
      'Year Long': [
        {
          id: 73,
          key: 'csa',
          display_name: 'Computer Science A',
          course_versions: [
            [
              370,
              {
                id: 370,
                key: '2019',
                version_year: '19-20',
                content_root_id: 32,
                name: 'Informática A (19-20)',
                path: '/courses/csa-2019',
                type: 'UnitGroup',
                is_stable: true,
                is_recommended: false,
                locales: ['English'],
                units: {
                  173: {
                    id: 173,
                    name: "Programación Orientada a Objetos ('19-'20)",
                    path: '/s/csa1-2019',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 1,
                    requires_verified_instructor: true,
                  },
                },
              },
            ],
            [
              373,
              {
                id: 373,
                key: '2022',
                version_year: '22-23',
                content_root_id: 32,
                name: 'Informática A (22-23)',
                path: '/courses/csa-2022',
                type: 'UnitGroup',
                is_stable: true,
                is_recommended: false,
                locales: ['English'],
                units: {
                  173: {
                    id: 173,
                    name: "Programación Orientada a Objetos ('22-'23)",
                    path: '/s/csa1-2022',
                    lesson_extras_available: false,
                    text_to_speech_enabled: true,
                    position: 1,
                    requires_verified_instructor: true,
                  },
                },
              },
            ],
            [
              377,
              {
                id: 377,
                key: '2020',
                version_year: '',
                content_root_id: 36,
                name: 'Piloto de CSA',
                path: '/courses/csa-pilot',
                type: 'UnitGroup',
                is_stable: false,
                is_recommended: false,
                locales: ['English'],
                units: {
                  177: {
                    id: 177,
                    name: 'Programación Orientada a Objetos *',
                    path: '/s/csa1-pilot',
                    lesson_extras_available: false,
                    text_to_speech_enabled: false,
                    position: 1,
                    requires_verified_instructor: true,
                  },
                },
              },
            ],
            [
              775,
              {
                id: 775,
                key: '2023',
                version_year: '23-24',
                content_root_id: 62,
                name: 'Informática A (23-24)',
                path: '/courses/csa-2023',
                type: 'UnitGroup',
                is_stable: false,
                is_recommended: false,
                locales: ['English'],
                units: {
                  174: {
                    id: 174,
                    name: 'Programación Orientada a Objetos *',
                    path: '/s/csa1-2023',
                    lesson_extras_available: false,
                    text_to_speech_enabled: false,
                    position: 1,
                    requires_verified_instructor: true,
                  },
                },
              },
            ],
          ],
        },
      ],
    },
  },
};

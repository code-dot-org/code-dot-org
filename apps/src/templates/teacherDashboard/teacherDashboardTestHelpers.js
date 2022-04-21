export const testSection = {
  id: 11,
  courseId: 29,
  courseOfferingId: 2,
  courseVersionId: 3,
  unitId: null,
  name: 'my_section',
  loginType: 'word',
  grade: '3',
  providerManaged: false,
  lessonExtras: false,
  ttsAutoplayEnabled: false,
  pairingAllowed: true,
  studentCount: 10,
  code: 'PMTKVH'
};
export const noStudentsSection = {
  id: 11,
  courseId: 29,
  courseOfferingId: 2,
  courseVersionId: 3,
  unitId: null,
  name: 'my_section',
  loginType: 'word',
  grade: '3',
  providerManaged: false,
  lessonExtras: false,
  ttsAutoplayEnabled: false,
  pairingAllowed: true,
  studentCount: 0,
  code: 'PMTKVH'
};

export const courseOfferings = {
  1: {
    id: 1,
    display_name: 'Course A',
    category: 'csf',
    is_featured: false,
    participant_audience: 'student',
    course_versions: {
      1: {
        id: 1,
        key: '2017',
        version_year: '2017',
        content_root_id: 1,
        name: 'Course A',
        path: '/s/coursea-2017',
        type: 'Script',
        is_stable: true,
        is_recommended: false,
        locales: ['العربية', 'Čeština', 'Deutsch', 'English'],
        units: {
          1: {
            id: 1,
            name: 'Course A',
            path: '/s/coursea-2017',
            lesson_extras_available: true,
            position: null
          }
        }
      },
      2: {
        id: 2,
        key: '2018',
        version_year: '2018',
        content_root_id: 2,
        name: 'Course A',
        path: '/s/coursea-2018',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: ['English', 'Italiano', 'Slovenčina'],
        units: {
          2: {
            id: 2,
            name: 'Course A (2018)',
            path: '/s/coursea-2018',
            lesson_extras_available: true,
            position: null
          }
        }
      }
    }
  },
  2: {
    id: 2,
    display_name: 'Computer Science Discoveries',
    category: 'full_course',
    is_featured: false,
    participant_audience: 'student',
    course_versions: {
      3: {
        id: 3,
        key: '2017',
        version_year: "'17-'18",
        content_root_id: 52,
        name: 'CS Discoveries 2017',
        path: '/courses/csd-2017',
        type: 'UnitGroup',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: {
          3: {
            id: 3,
            name: 'Unit 1',
            path: '/s/csd1-2017',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 1
          },
          4: {
            id: 4,
            name: 'Unit 2',
            path: '/s/csd2-2017',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 2
          }
        }
      },
      4: {
        id: 4,
        key: '2018',
        version_year: "'18-'19",
        content_root_id: 51,
        name: 'CS Discoveries 2018',
        path: '/courses/csd-2018',
        type: 'UnitGroup',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          5: {
            id: 5,
            name: 'Unit 1',
            path: '/s/csd1-2018',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 1
          },
          6: {
            id: 6,
            name: 'Unit 2',
            path: '/s/csd2-2018',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 2
          }
        }
      }
    }
  },
  3: {
    id: 3,
    display_name: 'Computer Science A',
    category: 'full_course',
    is_featured: false,
    participant_audience: 'student',
    course_versions: {
      5: {
        id: 5,
        key: '2022',
        version_year: '2022',
        content_root_id: 50,
        name: 'CS A',
        path: '/courses/csa-2022',
        type: 'UnitGroup',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          7: {
            id: 7,
            name: 'Unit 1',
            path: '/s/csa1-2022',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 1
          },
          8: {
            id: 8,
            name: 'Unit 2',
            path: '/s/csa2-2022',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 2
          }
        }
      }
    }
  },
  4: {
    id: 4,
    display_name: 'Flappy',
    category: 'hoc',
    is_featured: false,
    participant_audience: 'student',
    course_versions: {
      6: {
        id: 6,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 9,
        name: 'Flappy',
        path: '/s/flappy',
        type: 'Script',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: {
          9: {
            id: 9,
            name: 'Flappy',
            path: '/s/flappy',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: null
          }
        }
      }
    }
  },
  5: {
    id: 5,
    display_name: 'Hello World',
    category: 'hoc',
    is_featured: true,
    participant_audience: 'student',
    course_versions: {
      7: {
        id: 7,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 10,
        name: 'Hello World',
        path: '/s/hello-world',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          10: {
            id: 10,
            name: 'Hello World',
            path: '/s/hello-world',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: null
          }
        }
      }
    }
  },
  6: {
    id: 6,
    display_name: 'Poem Art',
    category: 'hoc',
    is_featured: true,
    participant_audience: 'student',
    course_versions: {
      8: {
        id: 8,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 11,
        name: 'Poem Art',
        path: '/s/poem-art',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          11: {
            id: 11,
            name: 'Poem Art',
            path: '/s/poem-art',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: null
          }
        }
      }
    }
  },
  7: {
    id: 7,
    display_name: 'Artist',
    category: 'hoc',
    is_featured: false,
    participant_audience: 'student',
    course_versions: {
      9: {
        id: 9,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 12,
        name: 'Artist',
        path: '/s/artist',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          12: {
            id: 12,
            name: 'Artist',
            path: '/s/artist',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: null
          }
        }
      }
    }
  },
  8: {
    id: 8,
    display_name: 'Self Paced PL CSP',
    category: 'self_paced_pl',
    is_featured: false,
    participant_audience: 'teacher',
    course_versions: {
      10: {
        id: 10,
        key: '2021',
        version_year: '2021',
        content_root_id: 53,
        name: 'Self Paced PL CSP 2021',
        path: '/courses/self-paced-pl-csp-2021',
        type: 'UnitGroup',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          13: {
            id: 13,
            name: 'Unit 1',
            path: '/s/self-paced-pl-csp1-2021',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 1
          },
          14: {
            id: 14,
            name: 'Unit 2',
            path: '/s/self-paced-pl-csp2-2021',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: 2
          }
        }
      }
    }
  },
  9: {
    id: 9,
    display_name: 'Virtual PL CSP',
    category: 'virtual_pl',
    is_featured: false,
    participant_audience: 'teacher',
    course_versions: {
      11: {
        id: 11,
        key: '2020',
        version_year: '2020',
        content_root_id: 15,
        name: 'Virtual PL CSP 2020',
        path: '/s/vpl-csp-2020',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          15: {
            id: 15,
            name: 'Virtual PL CSP 2020',
            path: '/s/vpl-csp-2020',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: null
          }
        }
      },
      12: {
        id: 12,
        key: '2021',
        version_year: '2021',
        content_root_id: 16,
        name: 'Virtual PL CSP 2021',
        path: '/s/vpl-csp-2021',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {
          16: {
            id: 16,
            name: 'Virtual PL CSP 2021',
            path: '/s/vpl-csp-2021',
            lesson_extras_available: false,
            text_to_speech_enabled: false,
            position: null
          }
        }
      }
    }
  }
};

export const fakeCoursesWithProgress = [
  {
    display_name: 'Course A',
    units: [
      {
        id: 2,
        version_year: '2018',
        key: 'coursea-2018',
        name: 'Course A (2018)',
        position: null
      },
      {
        id: 1,
        version_year: '2017',
        key: 'coursea-2017',
        name: 'Course A (2017)',
        position: null
      }
    ]
  },
  {
    display_name: 'CS Discoveries 2018',
    units: [
      {
        id: 5,
        version_year: null,
        key: 'csd1-2018',
        name: 'Unit 1',
        position: 1
      },
      {
        id: 6,
        version_year: null,
        key: 'csd2-2018',
        name: 'Unit 2',
        position: 2
      }
    ]
  },
  {
    display_name: 'Flappy',
    units: [
      {
        id: 9,
        version_year: 'unversioned',
        key: 'flappy',
        name: 'Flappy',
        position: null,
        description: 'Make a flappy game!'
      }
    ]
  }
];

export const testSection = {
  id: 11,
  courseId: 29,
  courseOfferingId: 2,
  courseVersionId: 3,
  scriptId: null,
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
  scriptId: null,
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

export const validAssignments = {
  '29_null': {
    id: 29,
    name: 'CS Discoveries 2017',
    script_name: 'csd',
    category: 'Full Courses',
    position: 1,
    category_priority: 0,
    courseId: 29,
    scriptId: null,
    assignId: '29_null',
    path: '//localhost-studio.code.org:3000/courses/csd',
    assignment_family_name: 'csd',
    assignment_family_title: 'CS Discoveries',
    version_year: '2017',
    version_title: "'17-'18"
  },
  null_168: {
    id: 168,
    name: 'Unit 1: Problem Solving',
    script_name: 'csd1',
    category: 'CS Discoveries',
    position: 0,
    category_priority: 7,
    courseId: null,
    scriptId: 168,
    assignId: 'null_168',
    path: '//localhost-studio.code.org:3000/s/csd1-2019',
    assignment_family_name: 'csd1',
    assignment_family_title: 'Unit 1: Problem Solving',
    version_year: '2017',
    version_title: '2017'
  }
};

export const assignmentFamilies = [
  {
    name: 'CS Discoveries 2017',
    category: 'Full Courses',
    position: 1,
    category_priority: 0,
    assignment_family_name: 'csd',
    assignment_family_title: 'CS Discoveries'
  },
  {
    name: 'Unit 1: Problem Solving',
    category: 'CS Discoveries',
    position: 0,
    category_priority: 7,
    assignment_family_name: 'csd1',
    assignment_family_title: 'Unit 1: Problem Solving'
  }
];

export const courseOfferings = {
  1: {
    id: 1,
    display_name: 'Course A',
    category: 'csf',
    is_featured: false,
    course_versions: {
      1: {
        id: 1,
        key: '2017',
        version_year: '2017',
        content_root_id: 10,
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
        content_root_id: 11,
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
    course_versions: {
      3: {
        id: 3,
        key: '2017',
        version_year: "'17-'18",
        content_root_id: 12,
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
        content_root_id: 13,
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
    course_versions: {
      5: {
        id: 5,
        key: '2022',
        version_year: '2022',
        content_root_id: 14,
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
    course_versions: {
      6: {
        id: 6,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 15,
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
    course_versions: {
      7: {
        id: 7,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 16,
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
    course_versions: {
      8: {
        id: 8,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 17,
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
    course_versions: {
      9: {
        id: 9,
        key: 'unversioned',
        version_year: 'unversioned',
        content_root_id: 18,
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
  }
};

export const testSection = {
  id: 11,
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
    course_versions: {
      1: {
        id: 1,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: ['العربية', 'Čeština', 'Deutsch', 'English'],
        content_root: {
          id: 10,
          name: 'Course A',
          path: '/s/coursea-2017',
          type: 'Script'
        },
        units: {
          1: {
            id: 1,
            name: 'Course A',
            path: '/s/coursea-2017',
            lesson_extras_available: true
          }
        }
      },
      2: {
        id: 2,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: ['English', 'Italiano', 'Slovenčina'],
        content_root: {
          id: 11,
          name: 'Course A',
          path: '/s/coursea-2018',
          type: 'Script'
        },
        units: {
          2: {
            id: 2,
            name: 'Course A (2018)',
            path: '/s/coursea-2018',
            lesson_extras_available: true
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
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: [],
        content_root: {
          id: 12,
          name: 'CS Discoveries 2017',
          path: '/courses/csd-2017',
          type: 'UnitGroup'
        },
        units: {
          3: {
            id: 3,
            name: 'Unit 1',
            path: '/s/csd1-2017',
            lesson_extras_available: false
          },
          4: {
            id: 4,
            name: 'Unit 2',
            path: '/s/csd2-2017',
            lesson_extras_available: false
          }
        }
      },
      4: {
        id: 4,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: [],
        content_root: {
          id: 13,
          name: 'CS Discoveries 2018',
          path: '/courses/csd-2018',
          type: 'UnitGroup'
        },
        units: {
          5: {
            id: 5,
            name: 'Unit 1',
            path: '/s/csd1-2018',
            lesson_extras_available: false
          },
          6: {
            id: 6,
            name: 'Unit 2',
            path: '/s/csd2-2018',
            lesson_extras_available: false
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
        version_year: '2022',
        display_name: '2022',
        is_stable: true,
        is_recommended: true,
        locales: [],
        content_root: {
          id: 14,
          name: 'CS A',
          path: '/courses/csa-2022',
          type: 'UnitGroup'
        },
        units: {
          7: {
            id: 7,
            name: 'Unit 1',
            path: '/s/csa1-2022',
            lesson_extras_available: false
          },
          8: {
            id: 8,
            name: 'Unit 2',
            path: '/s/csa2-2022',
            lesson_extras_available: false
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
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: false,
        locales: [],
        content_root: {
          id: 15,
          name: 'Flappy',
          path: '/s/flappy',
          type: 'Script'
        },
        units: {
          9: {
            id: 9,
            name: 'Flappy',
            path: '/s/flappy',
            lesson_extras_available: false
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
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: true,
        locales: [],
        content_root: {
          id: 16,
          name: 'Hello World',
          path: '/s/hello-world',
          type: 'Script'
        },
        units: {
          10: {
            id: 10,
            name: 'Hello World',
            path: '/s/hello-world',
            lesson_extras_available: false
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
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: true,
        locales: [],
        content_root: {
          id: 17,
          name: 'Poem Art',
          path: '/s/poem-art',
          type: 'Script'
        },
        units: {
          11: {
            id: 11,
            name: 'Poem Art',
            path: '/s/poem-art',
            lesson_extras_available: false
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
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: true,
        locales: [],
        content_root: {
          id: 18,
          name: 'Artist',
          path: '/s/artist',
          type: 'Script'
        },
        units: {
          12: {
            id: 12,
            name: 'Artist',
            path: '/s/artist',
            lesson_extras_available: false
          }
        }
      }
    }
  }
};

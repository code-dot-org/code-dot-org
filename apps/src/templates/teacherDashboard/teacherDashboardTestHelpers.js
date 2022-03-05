export const testSection = {
  id: 11,
  courseId: 29,
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
        units: {1: {id: 1, name: 'Course A'}}
      },
      2: {
        id: 2,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: ['English', 'Italiano', 'Slovenčina'],
        //TODO: Add content roots here in test data
        units: {
          2: {
            id: 2,
            name: 'Course A (2018)'
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
        units: {3: {id: 3, name: 'Unit 1'}, 4: {id: 4, name: 'Unit 2'}}
      },
      4: {
        id: 3,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {5: {id: 5, name: 'Unit 1'}, 6: {id: 6, name: 'Unit 2'}}
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
        units: {7: {id: 7, name: 'Unit 1'}, 8: {id: 8, name: 'Unit 2'}}
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
        units: {9: {id: 9, name: 'Flappy'}}
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
        units: {10: {id: 10, name: 'Hello World'}}
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
        units: {11: {id: 11, name: 'Poem Art'}}
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
        units: {12: {id: 12, name: 'Artist'}}
      }
    }
  }
};

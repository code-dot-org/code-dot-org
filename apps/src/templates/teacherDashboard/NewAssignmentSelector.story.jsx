import React from 'react';
import NewAssignmentSelector from './NewAssignmentSelector';

const styles = {
  dropdown: {
    padding: '0.3em'
  }
};

const courseOfferings = [
  {
    id: 1,
    display_name: 'Course A',
    category: 'csf',
    is_featured: false,
    course_versions: [
      {
        id: 84,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: [
          'العربية',
          'Čeština',
          'Deutsch',
          'English',
          'Español (España)',
          'Español (LATAM)',
          'Français',
          'हिन्दी',
          'Bahasa Indonesia',
          'Italiano',
          '日本語',
          '한국어',
          'Монгол хэл',
          'Polski',
          'Português (Brasil)',
          'Português (Portugal)',
          'Română',
          'Pусский',
          'Slovenčina',
          'Türkçe',
          'اردو',
          'Oʻzbekcha',
          'Tiếng Việt',
          '简体字',
          '繁體字'
        ],
        units: [{id: 94, name: 'Course A'}]
      },
      {
        id: 85,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: false,
        locales: ['English', 'Italiano', 'Slovenčina'],
        units: [{id: 95, name: 'Course A (2018)'}]
      },
      {
        id: 86,
        version_year: '2019',
        display_name: '2019',
        is_stable: true,
        is_recommended: false,
        locales: ['Čeština', 'English', 'Slovenčina'],
        units: [{id: 96, name: 'Course A (2019)'}]
      },
      {
        id: 87,
        version_year: '2020',
        display_name: '2020',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [{id: 97, name: 'Course A (2020)'}]
      },
      {
        id: 88,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: false,
        locales: [
          'English',
          'Español (España)',
          'Español (LATAM)',
          'Português (Brasil)',
          'Română',
          'Pусский',
          'Slovenčina'
        ],
        units: [{id: 551, name: 'Course A (2021)'}]
      },
      {
        id: 261,
        version_year: '2022',
        display_name: '2022',
        is_stable: false,
        is_recommended: false,
        locales: ['English'],
        units: [{id: 10211, name: 'Course A (2021)'}]
      }
    ]
  },
  {
    id: 2,
    display_name: 'Course B',
    category: 'csf',
    is_featured: false,
    course_versions: [
      {
        id: 89,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: [
          'العربية',
          'Čeština',
          'Deutsch',
          'English',
          'Español (España)',
          'Español (LATAM)',
          'Français',
          'हिन्दी',
          'Bahasa Indonesia',
          'Italiano',
          '日本語',
          '한국어',
          'Монгол хэл',
          'Polski',
          'Português (Brasil)',
          'Português (Portugal)',
          'Română',
          'Pусский',
          'Slovenčina',
          'தமிழ்',
          'ภาษาไทย',
          'Türkçe',
          'اردو',
          'Oʻzbekcha',
          '简体字',
          '繁體字'
        ],
        units: [{id: 99, name: 'Course B'}]
      },
      {
        id: 90,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: false,
        locales: ['English', 'Italiano', 'Slovenčina'],
        units: [{id: 100, name: 'Course B (2018)'}]
      },
      {
        id: 91,
        version_year: '2019',
        display_name: '2019',
        is_stable: true,
        is_recommended: false,
        locales: ['Čeština', 'English', 'Slovenčina'],
        units: [{id: 101, name: 'Course B (2019)'}]
      },
      {
        id: 92,
        version_year: '2020',
        display_name: '2020',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [{id: 102, name: 'Course B (2020)'}]
      },
      {
        id: 93,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: false,
        locales: [
          'English',
          'Español (España)',
          'Español (LATAM)',
          'Français',
          'Português (Brasil)',
          'Română',
          'Pусский',
          'Slovenčina'
        ],
        units: [{id: 525, name: 'Course B (2021)'}]
      },
      {
        id: 276,
        version_year: '2022',
        display_name: '2022',
        is_stable: false,
        is_recommended: false,
        locales: ['English'],
        units: [{id: 11494, name: 'Course B (2021)'}]
      }
    ]
  },
  {
    id: 13,
    display_name: 'Computer Science A',
    category: 'full_course',
    is_featured: false,
    course_versions: [
      {
        id: 144,
        version_year: '2020',
        display_name: '2020',
        is_stable: false,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 1148, name: 'Object Oriented Programming'},
          {id: 1149, name: 'Giving Objects State'},
          {id: 1150, name: 'Expanding Program Data'},
          {id: 1151, name: 'Expanding Program Logic'},
          {id: 1152, name: 'Giving Objects Organization'},
          {id: 1153, name: 'Expanding Program Capabilities'},
          {id: 1154, name: 'Expanding Software Design'},
          {id: 1155, name: 'Giving Objects Life'},
          {id: 1156, name: ''}
        ]
      },
      {
        id: 287,
        version_year: '2022',
        display_name: '2022',
        is_stable: false,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 12735, name: "Object-Oriented Programming ('22-'23)"},
          {id: 12739, name: "Giving Objects State ('22-'23)"},
          {id: 12743, name: "Expanding Program Data ('22-'23)"}
        ]
      }
    ]
  },
  {
    id: 9,
    display_name: 'Computer Science Discoveries',
    category: 'full_course',
    is_featured: false,
    course_versions: [
      {
        id: 124,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 140, name: "CSD Unit 1 - Problem Solving ('17-'18)"},
          {id: 148, name: "CSD Unit 2 - Web Development ('17-'18)"},
          {id: 159, name: "CSD Unit 3 - Animations and Games ('17-'18)"},
          {id: 168, name: "CSD Unit 4 - The Design Process ('17-'18)"},
          {id: 177, name: "CSD Unit 5 - Data and Society ('17-'18)"},
          {id: 185, name: "CSD Unit 6 - Physical Computing ('17-'18)"}
        ]
      },
      {
        id: 125,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 141, name: "CSD Unit 1 - Problem Solving ('18-'19)"},
          {id: 149, name: "CSD Unit 2 - Web Development ('18-'19)"},
          {id: 160, name: "CSD Unit 3 - Animations and Games ('18-'19)"},
          {id: 169, name: "CSD Unit 4 - The Design Process ('18-'19)"},
          {id: 178, name: "CSD Unit 5 - Data and Society ('18-'19)"},
          {id: 186, name: "CSD Unit 6 - Physical Computing ('18-'19)"},
          {id: 134, name: "CSD Student Post-Course Survey ('18-'19)"}
        ]
      },
      {
        id: 126,
        version_year: '2019',
        display_name: '2019',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {
            id: 142,
            name: "CSD Unit 1 - Problem Solving and Computing ('19-'20)"
          },
          {id: 150, name: "CSD Unit 2 - Web Development ('19-'20)"},
          {id: 161, name: "CSD Unit 3 - Animations and Games ('19-'20)"},
          {id: 170, name: "CSD Unit 4 - The Design Process ('19-'20)"},
          {id: 179, name: "CSD Unit 5 - Data and Society ('19-'20)"},
          {id: 187, name: "CSD Unit 6 - Physical Computing ('19-'20)"}
        ]
      },
      {
        id: 253,
        version_year: '2020',
        display_name: '2020',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {
            id: 9046,
            name: "CSD Unit 1 - Problem Solving and Computing ('20-'21)"
          },
          {id: 151, name: "CSD Unit 2 - Web Development ('20-'21)"},
          {
            id: 162,
            name: "CSD Unit 3 - Interactive Animations and Games ('20-'21)"
          },
          {id: 171, name: "CSD Unit 4 - The Design Process ('20-'21)"},
          {id: 180, name: "CSD Unit 5 - Data and Society ('20-'21)"},
          {id: 188, name: "CSD Unit 6 - Physical Computing ('20-'21)"}
        ]
      },
      {
        id: 128,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: true,
        locales: ['English'],
        units: [
          {id: 530, name: "Problem Solving and Computing ('21-'22)"},
          {id: 531, name: "Web Development ('21-'22)"},
          {id: 532, name: "Interactive Animations and Games ('21-'22)"},
          {id: 533, name: "The Design Process ('21-'22)"},
          {id: 534, name: "Data and Society ('21-'22)"},
          {id: 535, name: "Physical Computing ('21-'22)"},
          {id: 2109, name: 'AI and Machine Learning'},
          {id: 3593, name: 'CS Discoveries Post-Course Survey'}
        ]
      }
    ]
  },
  {
    id: 11,
    display_name: 'Computer Science Principles',
    category: 'full_course',
    is_featured: false,
    course_versions: [
      {
        id: 137,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 217, name: "CSP Unit 1 - The Internet ('17-'18)"},
          {id: 229, name: "CSP Unit 2 - Digital Information ('17-'18)"},
          {id: 238, name: "CSP Unit 3 - Intro to Programming ('17-'18)"},
          {id: 252, name: "CSP Unit 4 - Big Data and Privacy ('17-'18)"},
          {id: 262, name: "CSP Unit 5 - Building Apps ('17-'18)"},
          {id: 205, name: "Explore - AP Performance Task Prep ('17-'18)"},
          {id: 200, name: "Create - AP Performance Task Prep ('17-'18)"},
          {
            id: 294,
            name:
              "CSP Post-AP - Databases and Using Data in Your Apps ('17-'18)"
          },
          {id: 215, name: "CSP Student Post-Course Survey ('17-'18)"}
        ]
      },
      {
        id: 138,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 218, name: "CSP Unit 1 - The Internet ('18-'19)"},
          {id: 230, name: "CSP Unit 2 - Digital Information ('18-'19)"},
          {id: 239, name: "CSP Unit 3 - Intro to Programming ('18-'19)"},
          {id: 253, name: "CSP Unit 4 - Big Data and Privacy ('18-'19)"},
          {id: 206, name: "Explore - AP Performance Task Prep ('18-'19)"},
          {id: 263, name: "CSP Unit 5 - Building Apps ('18-'19)"},
          {id: 201, name: "Create - AP Performance Task Prep ('18-'19)"},
          {id: 295, name: "Post AP - Data Tools ('18-'19)"},
          {id: 214, name: "CSP Student Post-Course Survey ('18-'19)"}
        ]
      },
      {
        id: 139,
        version_year: '2019',
        display_name: '2019',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 219, name: "CSP Unit 1 - The Internet ('19-'20)"},
          {id: 231, name: "CSP Unit 2 - Digital Information ('19-'20)"},
          {id: 240, name: "CSP Unit 3 - Intro to Programming ('19-'20)"},
          {id: 254, name: "CSP Unit 4 - Big Data and Privacy ('19-'20)"},
          {id: 207, name: "Explore - AP Performance Task Prep ('19-'20)"},
          {id: 264, name: "CSP Unit 5 - Building Apps ('19-'20)"},
          {id: 202, name: "Create - AP Performance Task Prep ('19-'20)"},
          {id: 296, name: "Post AP - Data Tools ('19-'20)"}
        ]
      },
      {
        id: 140,
        version_year: '2020',
        display_name: '2020',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 220, name: "CSP Unit 1 - Digital Information ('20-'21)"},
          {id: 232, name: "CSP Unit 2 - The Internet ('20-'21)"},
          {id: 241, name: "CSP Unit 3 - Intro to App Design ('20-'21)"},
          {
            id: 255,
            name:
              "CSP Unit 4 - Variables, Conditionals, and Functions ('20-'21)"
          },
          {
            id: 265,
            name: "CSP Unit 5 - Lists, Loops, and Traversals ('20-'21)"
          },
          {id: 273, name: "CSP Unit 6 - Algorithms ('20-'21)"},
          {
            id: 278,
            name: "CSP Unit 7 - Parameters, Return, and Libraries ('20-'21)"
          },
          {id: 281, name: "CSP Unit 8 - Create PT Prep ('20-'21)"},
          {id: 284, name: "CSP Unit 9 - Data ('20-'21)"},
          {
            id: 226,
            name: "CSP Unit 10 - Cybersecurity and Global Impacts ('20-'21)"
          },
          {id: 1625, name: "CSP Student Post-Course Survey ('20-'21)"}
        ]
      },
      {
        id: 141,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: true,
        locales: ['English'],
        units: [
          {id: 537, name: "Digital Information ('21-'22)"},
          {id: 539, name: "The Internet ('21-'22)"},
          {id: 540, name: "Intro to App Design ('21-'22)"},
          {id: 712, name: "Variables, Conditionals, and Functions ('21-'22)"},
          {id: 542, name: "Lists, Loops, and Traversals ('21-'22)"},
          {id: 543, name: "Algorithms ('21-'22)"},
          {id: 544, name: "Parameters, Return, and Libraries ('21-'22)"},
          {id: 545, name: "Create PT Prep ('21-'22)"},
          {id: 546, name: "Data ('21-'22)"},
          {id: 538, name: "Cybersecurity and Global Impacts ('21-'22)"},
          {id: 12860, name: 'CS Principles Post-Course Survey'}
        ]
      },
      {
        id: 284,
        version_year: '2022',
        display_name: '2022',
        is_stable: false,
        is_recommended: false,
        locales: ['English'],
        units: [
          {id: 11668, name: "Digital Information ('21-'22)"},
          {id: 11680, name: "The Internet ('21-'22)"},
          {id: 11689, name: "Intro to App Design ('21-'22)"},
          {id: 11703, name: "Variables, Conditionals, and Functions ('21-'22)"},
          {id: 11712, name: "Lists, Loops, and Traversals ('21-'22)"},
          {id: 11720, name: "Algorithms ('21-'22)"},
          {id: 12925, name: "Parameters, Return, and Libraries ('21-'22)"},
          {id: 11727, name: "Create PT Prep ('21-'22)"},
          {id: 11730, name: "Data ('21-'22)"},
          {id: 11674, name: "Cybersecurity and Global Impacts ('21-'22)"}
        ]
      }
    ]
  },
  {
    id: 19,
    display_name: 'AI and Machine Learning Module',
    category: 'aiml',
    is_featured: false,
    course_versions: [
      {
        id: 151,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: true,
        locales: ['English'],
        units: [{id: 1863, name: 'AI and Machine Learning Module'}]
      }
    ]
  },
  {
    id: 21,
    display_name: 'Flappy Code',
    category: 'hoc',
    is_featured: false,
    course_versions: [
      {
        id: 153,
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: false,
        is_recommended: false,
        locales: ['English'],
        units: [{id: 6, name: 'Flappy Code'}]
      }
    ]
  },
  {
    id: 81,
    display_name: 'Hello World: Retro',
    category: 'hoc',
    is_featured: true,
    course_versions: [
      {
        id: 241,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: false,
        locales: ['English'],
        units: [{id: 7687, name: 'Hello World: Retro'}]
      }
    ]
  }
];

const assigned = {
  course_offering: courseOfferings[0],
  course_version: courseOfferings[0].course_versions[0],
  unit: courseOfferings[0].course_versions[0].units[0]
};

export default storybook => {
  storybook.storiesOf('NewAssignmentSelector', module).addStoryTable([
    {
      name: 'basic',
      story: () => {
        return (
          <NewAssignmentSelector
            assigned={assigned}
            courseOfferings={courseOfferings}
            dropdownStyle={styles.dropdown}
          />
        );
      }
    }
  ]);
};

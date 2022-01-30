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
        locales: ['English'],
        units: [{id: 551, name: 'Course A (2021)'}]
      }
    ]
  },
  {
    id: 2,
    display_name: 'courseb',
    course_versions: [
      {
        id: 89,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: [
          'ar-SA',
          'cs-CZ',
          'de-DE',
          'es-ES',
          'es-MX',
          'fr-FR',
          'hi-IN',
          'id-ID',
          'it-IT',
          'ja-JP',
          'ko-KR',
          'mn-MN',
          'pl-PL',
          'pt-BR',
          'pt-PT',
          'ro-RO',
          'ru-RU',
          'sk-SK',
          'ta-IN',
          'th-TH',
          'tr-TR',
          'ur-PK',
          'uz-UZ',
          'zh-CN',
          'zh-TW'
        ],
        units: [{id: 99, name: 'Course B'}]
      },
      {
        id: 90,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: false,
        locales: ['it-IT', 'sk-SK'],
        units: [{id: 100, name: 'Course B (2018)'}]
      },
      {
        id: 91,
        version_year: '2019',
        display_name: '2019',
        is_stable: true,
        is_recommended: false,
        locales: ['cs-CZ', 'sk-SK'],
        units: [{id: 101, name: 'Course B (2019)'}]
      },
      {
        id: 92,
        version_year: '2020',
        display_name: '2020',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: [{id: 102, name: 'Course B (2020)'}]
      },
      {
        id: 93,
        version_year: '2021',
        display_name: '2021',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: [{id: 525, name: 'Course B (2021)'}]
      }
    ]
  },
  {
    id: 13,
    display_name: 'csa',
    course_versions: [
      {
        id: 144,
        version_year: '2020',
        display_name: '2020',
        is_stable: false,
        is_recommended: true,
        locales: [],
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
      }
    ]
  },
  {
    id: 9,
    display_name: 'csd',
    course_versions: [
      {
        id: 124,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: [],
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
        locales: [],
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
        locales: [],
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
        locales: [],
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
        locales: [],
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

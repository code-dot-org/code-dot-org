export const sampleActivities = [
  {
    key: 'activity-1',
    displayName: 'Main Activity',
    position: 1,
    duration: 20,
    activitySections: [
      {
        key: 'section-3',
        position: 1,
        displayName: 'Making programs',
        duration: 10,
        remarks: true,
        scriptLevels: [],
        text: 'Simple text',
        tips: []
      },
      {
        key: 'section-1',
        position: 2,
        displayName: '',
        duration: 0,
        remarks: false,
        scriptLevels: [],
        text: 'Details about this section',
        tips: [
          {
            key: 'tip-1',
            type: 'teachingTip',
            markdown: 'Teaching tip content'
          },
          {
            key: 'tip-2',
            type: 'discussionGoal',
            markdown: 'Discussion Goal content'
          }
        ]
      },
      {
        tips: [],
        key: 'progression-1',
        position: 3,
        displayName: '',
        duration: 0,
        remarks: false,
        text: 'This progression teaches you programming!',
        progressionName: 'Programming Progression Name',
        scriptLevels: [
          {
            id: '10',
            levels: [
              {
                name: 'Level 1',
                id: '1',
                url: 'levels/598/edit',
                icon: 'fa-desktop',
                isUnplugged: false,
                isConceptLevel: true,
                skin: null,
                videoKey: null,
                concepts: '',
                conceptDifficulty: ''
              }
            ],
            position: 1,
            levelNumber: 1,
            activeId: '1',
            kind: 'puzzle',
            bonus: false,
            assessment: false,
            challenge: false,
            expand: false
          },
          {
            id: '11',
            levels: [
              {
                name: 'Level 2',
                id: '2',
                url: '/levels/598/edit',
                icon: 'fa-desktop',
                isUnplugged: false,
                isConceptLevel: true,
                skin: null,
                videoKey: null,
                concepts: '',
                conceptDifficulty: ''
              },
              {
                name: 'Level 3',
                id: '3',
                url: '/levels/598/edit',
                icon: 'fa-desktop',
                isUnplugged: false,
                isConceptLevel: true,
                skin: null,
                videoKey: null,
                concepts: '',
                conceptDifficulty: ''
              }
            ],
            position: 2,
            levelNumber: 2,
            activeId: '2',
            kind: 'assessment',
            bonus: false,
            assessment: true,
            challenge: false,
            expand: false
          }
        ]
      }
    ]
  }
];

export const sampleActivityForLessonWithoutLessonPlan = {
  key: 'activity-1',
  displayName: '',
  position: 1,
  duration: 0,
  activitySections: [
    {
      tips: [],
      key: 'progression-1',
      position: 1,
      displayName: '',
      duration: 0,
      remarks: false,
      text: '',
      progressionName: 'Programming Progression Name',
      scriptLevels: [
        {
          id: '10',
          levels: [
            {
              name: 'LevelGroup 1',
              id: '1',
              url: 'levels/598/edit',
              icon: 'fa-desktop',
              isUnplugged: false,
              isConceptLevel: false,
              skin: null,
              videoKey: null,
              concepts: '',
              conceptDifficulty: ''
            }
          ],
          position: 1,
          levelNumber: 1,
          activeId: '1',
          kind: 'puzzle',
          bonus: false,
          assessment: true,
          challenge: false,
          expand: false
        }
      ]
    }
  ]
};

export const searchOptions = {
  levelOptions: [
    ['All types', ''],
    ['Applab', 'Applab'],
    ['Dancelab', 'Dancelab']
  ],
  scriptOptions: [
    ['All scripts', ''],
    ['Script 1', 'script-1'],
    ['Script 2', 'script-2']
  ],
  ownerOptions: [
    ['Any owner', ''],
    ['Levelbuilder 1', 1],
    ['Levelbuilder 2', 2]
  ]
};

export const sampleActivities = [
  {
    key: 'activity-1',
    displayName: 'Main Activity',
    position: 1,
    time: 20,
    activitySections: [
      {
        key: 'section-3',
        position: 1,
        displayName: 'Making programs',
        remarks: true,
        slide: false,
        levels: [],
        text: 'Simple text',
        tips: []
      },
      {
        key: 'section-1',
        position: 2,
        displayName: '',
        remarks: false,
        slide: true,
        levels: [],
        text: 'Details about this section',
        tips: [
          {
            key: 'tip-1',
            type: 'teachingTip',
            markdown: 'Teaching tip content'
          }
        ]
      },
      {
        tips: [],
        key: 'progression-1',
        position: 3,
        displayName: 'Programming Progression',
        remarks: false,
        slide: false,
        text: 'This progression teaches you programming!',
        levels: [
          {
            name: 'Level 1',
            levelNumber: 1,
            position: 1,
            activeId: 1,
            ids: [1],
            kind: 'puzzle',
            status: 'not started',
            url: 'https://levelbuilder-studio.code.org/levels/598/edit',
            icon: 'fa-desktop',
            isUnplugged: false,
            isCurrentLevel: false,
            isConceptLevel: true,
            named: false,
            assessment: false,
            challenge: false,
            sublevels: [],
            skin: null,
            videoKey: null,
            concepts: '',
            conceptDifficulty: ''
          },
          {
            name: 'Level 2',
            levelNumber: 2,
            position: 2,
            activeId: 2,
            ids: [2, 3],
            kind: 'assessment',
            status: 'not started',
            url: 'https://levelbuilder-studio.code.org/levels/598/edit',
            icon: 'fa-desktop',
            isUnplugged: false,
            isCurrentLevel: false,
            isConceptLevel: false,
            named: false,
            assessment: true,
            challenge: false,
            sublevels: [],
            skin: null,
            videoKey: null,
            concepts: '',
            conceptDifficulty: ''
          }
        ]
      }
    ]
  }
];

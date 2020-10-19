export const sampleActivities = [
  {
    id: 11,
    key: 'activity-1',
    displayName: 'Main Activity',
    position: 1,
    duration: 20,
    activitySections: [
      {
        id: 22,
        key: 'section-3',
        position: 1,
        displayName: 'Making programs',
        remarks: true,
        slide: false,
        scriptLevels: [],
        text: 'Simple text',
        tips: []
      },
      {
        id: 33,
        key: 'section-1',
        position: 2,
        displayName: '',
        remarks: false,
        slide: true,
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
        id: 44,
        tips: [],
        key: 'progression-1',
        position: 3,
        displayName: 'Programming Progression',
        remarks: false,
        slide: false,
        text: 'This progression teaches you programming!',
        scriptLevels: [
          {
            id: 10,
            levels: [
              {
                name: 'Level 1',
                id: 1,
                url: 'https://levelbuilder-studio.code.org/levels/598/edit',
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
            activeId: 1,
            kind: 'puzzle',
            bonus: false,
            assessment: false,
            challenge: false,
            expand: false
          },
          {
            id: 11,
            levels: [
              {
                name: 'Level 2',
                id: 2,
                url: 'https://levelbuilder-studio.code.org/levels/598/edit',
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
                id: 3,
                url: 'https://levelbuilder-studio.code.org/levels/598/edit',
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
            activeId: 2,
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

export const levelKeyList = {
  1: 'Level 1',
  2: 'Level 2 - 1',
  3: 'Level 2 - 2',
  4: 'blockly:Studio:playlab_1'
};

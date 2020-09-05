import {assert} from 'chai';
import {combineReducers} from 'redux';
import reducers, {
  addActivity,
  addActivitySection,
  moveActivitySection,
  setActivity,
  setActiveVariant,
  setField,
  reorderLevel,
  moveLevelToActivitySection
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

const getInitialState = () => ({
  levelKeyList: {},
  activities: [
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
          text:
            'Today we are going to be looking at some sample apps to explore their purpose and function.',
          tips: []
        },
        {
          key: 'section-1',
          position: 2,
          displayName: '',
          remarks: false,
          slide: true,
          levels: [],
          text:
            'In this activity you will be learning about making activities.',
          tips: [
            {
              key: 'tip-1',
              type: 'teachingTip',
              markdown:
                'After students are finished writing in their journals, discuss as a class or collect the journals to review student answers. \n- An input could be a user clicking a button or tapping the screen. \n- An output could be an image displayed or a sound played'
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
              status: 'not started',
              url: 'https://levelbuilder-studio.code.org/levels/598/edit',
              name: 'Level 1',
              icon: 'fa-desktop',
              isUnplugged: false,
              levelNumber: 1,
              isCurrentLevel: false,
              isConceptLevel: true,
              sublevels: [],
              position: 1,
              activeId: 1,
              ids: [1],
              kind: 'puzzle',
              skin: null,
              videoKey: null,
              concepts: '',
              conceptDifficulty: '',
              named: false,
              assessment: false,
              displayName: 'Level 1',
              challenge: false
            },
            {
              status: 'not started',
              url: 'https://levelbuilder-studio.code.org/levels/598/edit',
              icon: 'fa-desktop',
              name: 'Level 2',
              isUnplugged: false,
              levelNumber: 2,
              isCurrentLevel: false,
              isConceptLevel: false,
              sublevels: [],
              position: 2,
              activeId: 2,
              ids: [2, 3],
              kind: 'assessment',
              skin: null,
              videoKey: null,
              concepts: '',
              conceptDifficulty: '',
              named: false,
              assessment: true,
              challenge: false,
              displayName: 'Level 2'
            }
          ]
        },
        {
          key: 'section-2',
          displayName: 'Discussion',
          position: 4,
          remarks: false,
          slide: false,
          levels: [],
          text:
            '**Prompt:** With a partner, discuss the following and note down in your journal:\n - How does the user interact with the app?\n - What is the overall purpose of this app?\n - Who is the target audience?\n\n**Share Out:** As a class, discuss student answers to the discussion questions.',
          tips: [
            {
              key: 'tip-2',
              type: 'discussionGoal',
              markdown: 'Make sure to get to the point'
            },
            {
              key: 'tip-3',
              type: 'assessmentOpportunity',
              markdown: 'Are students getting it?'
            }
          ]
        }
      ]
    },
    {
      key: 'activity-2',
      displayName: '',
      time: 0,
      position: 2,
      activitySections: [
        {
          key: 'section-1',
          text: '',
          displayName: '',
          remarks: false,
          slide: false,
          tips: [],
          levels: [],
          position: 1
        }
      ]
    }
  ]
});

const reducer = combineReducers(reducers);

describe('activitiesEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('reorder levels', () => {
    const nextState = reducer(initialState, reorderLevel(1, 3, 2, 1))
      .activities;
    assert.deepEqual(
      nextState[0].activitySections[2].levels.map(l => l.activeId),
      [2, 1]
    );
  });
  it('moves level to activitySection', () => {
    const nextState = reducer(
      initialState,
      moveLevelToActivitySection(1, 3, 2, 2)
    ).activities;
    assert.deepEqual(
      nextState[0].activitySections[1].levels.map(l => l.activeId),
      [2]
    );
    assert.deepEqual(
      nextState[0].activitySections[2].levels.map(l => l.activeId),
      [1]
    );
  });

  it('add activity', () => {
    const nextState = reducer(initialState, addActivity(3, 'key')).activities;
    assert.equal(nextState[nextState.length - 1].displayName, '');
    assert.equal(nextState[nextState.length - 1].key, 'key');
  });
  it('add activitySection', () => {
    const nextState = reducer(
      initialState,
      addActivitySection(1, 'activitySection-key')
    ).activities;
    assert.deepEqual(nextState[0].activitySections.map(s => s.key), [
      'section-3',
      'section-1',
      'progression-1',
      'section-2',
      'activitySection-key'
    ]);
  });

  it('set active variant', () => {
    const nextState = reducer(initialState, setActiveVariant(1, 3, 1, 2))
      .activities;
    assert.equal(nextState[0].activitySections[2].levels[0].activeId, 2);
  });

  it('set level field', () => {
    let nextState = reducer(initialState, setField(1, 3, 1, {videoKey: '_a_'}));
    assert.equal(
      nextState.activities[0].activitySections[2].levels[0].videoKey,
      '_a_'
    );
    nextState = reducer(nextState, setField(1, 3, 1, {skin: '_b_'}));
    assert.equal(
      nextState.activities[0].activitySections[2].levels[0].skin,
      '_b_'
    );
    nextState = reducer(
      nextState,
      setField(1, 3, 1, {conceptDifficulty: '_c_'})
    );
    assert.equal(
      nextState.activities[0].activitySections[2].levels[0].conceptDifficulty,
      '_c_'
    );
    nextState = reducer(nextState, setField(1, 3, 1, {concepts: '_d_'}));
    assert.equal(
      nextState.activities[0].activitySections[2].levels[0].concepts,
      '_d_'
    );
  });

  describe('activities', () => {
    let initialActivities = [];

    beforeEach(() => {
      initialActivities = [
        {
          key: 'x',
          displayName: 'X',
          position: 1,
          activitySections: [
            {
              key: 'a',
              position: 1,
              displayName: 'A'
            },
            {
              key: 'b',
              position: 2,
              displayName: 'B'
            }
          ]
        },
        {
          key: 'y',
          displayName: 'Y',
          position: 2,
          activitySections: [
            {key: 'c', position: 1, displayName: 'C'},
            {key: 'd', position: 2, displayName: 'D'}
          ]
        }
      ];
      initialState.activities = initialActivities;
    });

    it('moves a activitySection up three times', () => {
      const key = 'd';
      let activityPosition = initialState.activities.find(activity =>
        activity.activitySections.find(
          activitySection => activitySection.key === key
        )
      ).position;
      let activitySectionPosition = initialState.activities[
        activityPosition - 1
      ].activitySections.find(activitySection => activitySection.key === key)
        .position;
      let state = reducer(
        initialState,
        moveActivitySection(activityPosition, activitySectionPosition, 'up')
      );
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [
              {
                key: 'a',
                position: 1,
                displayName: 'A'
              },
              {
                key: 'b',
                position: 2,
                displayName: 'B'
              }
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {
                key: 'd',
                position: 1,
                displayName: 'D'
              },
              {
                key: 'c',
                position: 2,
                displayName: 'C'
              }
            ]
          }
        ],
        state.activities,
        'first move changes position but not activity'
      );

      activityPosition = state.activities.find(activity =>
        activity.activitySections.find(
          activitySection => activitySection.key === key
        )
      ).position;
      activitySectionPosition = state.activities[
        activityPosition - 1
      ].activitySections.find(activitySection => activitySection.key === key)
        .position;
      state = reducer(
        state,
        moveActivitySection(activityPosition, activitySectionPosition, 'up')
      );
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [
              {
                key: 'a',
                position: 1,
                displayName: 'A'
              },
              {
                key: 'b',
                position: 2,
                displayName: 'B'
              },
              {
                key: 'd',
                position: 3,
                displayName: 'D'
              }
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {
                key: 'c',
                position: 1,
                displayName: 'C'
              }
            ]
          }
        ],
        state.activities,
        'second move changes activity but not position'
      );

      activityPosition = state.activities.find(activity =>
        activity.activitySections.find(
          activitySection => activitySection.key === key
        )
      ).position;
      activitySectionPosition = state.activities[
        activityPosition - 1
      ].activitySections.find(activitySection => activitySection.key === key)
        .position;
      state = reducer(
        state,
        moveActivitySection(activityPosition, activitySectionPosition, 'up')
      );
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [
              {
                key: 'a',
                position: 1,
                displayName: 'A'
              },
              {
                key: 'd',
                position: 2,
                displayName: 'D'
              },
              {
                key: 'b',
                position: 3,
                displayName: 'B'
              }
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {
                key: 'c',
                position: 1,
                displayName: 'C'
              }
            ]
          }
        ],
        state.activities,
        'third move changes position but not activity'
      );
    });

    describe('set activity', () => {
      it('moves unique activity to the end of the script', () => {
        let state = reducer(initialState, setActivity(2, 1, 2));
        assert.deepEqual(
          [
            {
              key: 'x',
              displayName: 'X',
              position: 1,
              activitySections: [
                {
                  key: 'a',
                  position: 1,
                  displayName: 'A'
                }
              ]
            },
            {
              key: 'y',
              displayName: 'Y',
              position: 2,
              activitySections: [
                {
                  key: 'c',
                  position: 1,
                  displayName: 'C'
                },
                {
                  key: 'd',
                  position: 2,
                  displayName: 'D'
                },
                {
                  key: 'b',
                  position: 3,
                  displayName: 'B'
                }
              ]
            }
          ],
          state.activities
        );
      });

      it('groups with others in same activity', () => {
        const newState = reducer(initialState, setActivity(2, 2, 1));
        assert.deepEqual(
          [
            {
              key: 'x',
              displayName: 'X',
              position: 1,
              activitySections: [
                {
                  key: 'a',
                  position: 1,
                  displayName: 'A'
                },
                {
                  key: 'b',
                  position: 2,
                  displayName: 'B'
                },
                {
                  key: 'd',
                  position: 3,
                  displayName: 'D'
                }
              ]
            },
            {
              key: 'y',
              displayName: 'Y',
              position: 2,
              activitySections: [
                {
                  key: 'c',
                  position: 1,
                  displayName: 'C'
                }
              ]
            }
          ],
          newState.activities
        );
      });
    });
  });
});

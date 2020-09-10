import {assert} from 'chai';
import {combineReducers} from 'redux';
import reducers, {
  addActivity,
  moveActivity,
  setActivity,
  removeActivity,
  updateActivityField,
  addActivitySection,
  moveActivitySection,
  removeActivitySection,
  updateActivitySectionField,
  addTip,
  addLevel,
  removeLevel,
  setActiveVariant,
  setField,
  reorderLevel,
  moveLevelToActivitySection,
  NEW_LEVEL_ID
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {sampleActivities} from './activitiesTestData';

const getInitialState = () => ({
  levelKeyList: {},
  activities: sampleActivities
});

const reducer = combineReducers(reducers);

describe('activitiesEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('add tip', () => {
    const nextState = reducer(
      initialState,
      addTip(1, 2, {
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.'
      })
    ).activities;
    assert.deepEqual(nextState[0].activitySections[1].tips.map(s => s.type), [
      'teachingTip',
      'contentCorner'
    ]);
  });

  describe('levels', () => {
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

    it('add level', () => {
      const nextState = reducer(
        initialState,
        addLevel(1, 3, {
          name: 'Level 3',
          levelNumber: 3,
          position: 3,
          icon: 'fa-desktop',
          ids: [NEW_LEVEL_ID],
          activeId: NEW_LEVEL_ID,
          kind: 'puzzle',
          status: 'not started',
          url: 'https://levelbuilder-studio.code.org/levels/598/edit',
          isUnplugged: false,
          isCurrentLevel: false,
          isConceptLevel: false,
          named: false,
          assessment: false,
          challenge: false,
          sublevels: [],
          skin: null,
          videoKey: null,
          concepts: '',
          conceptDifficulty: ''
        })
      ).activities;
      assert.deepEqual(
        nextState[0].activitySections[2].levels.map(s => s.name),
        ['Level 1', 'Level 2', 'Level 3']
      );
    });

    it('remove level', () => {
      const nextState = reducer(initialState, removeLevel(1, 3, 1)).activities;
      assert.deepEqual(
        nextState[0].activitySections[2].levels.map(s => s.name),
        ['Level 2']
      );
    });

    it('set active variant', () => {
      const nextState = reducer(initialState, setActiveVariant(1, 3, 1, 2))
        .activities;
      assert.equal(nextState[0].activitySections[2].levels[0].activeId, 2);
    });

    it('set level field', () => {
      let nextState = reducer(
        initialState,
        setField(1, 3, 1, {videoKey: '_a_'})
      );
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
            {key: 'a', position: 1, displayName: 'A'},
            {key: 'b', position: 2, displayName: 'B'}
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

    it('add activity', () => {
      const nextState = reducer(initialState, addActivity(3, 'key')).activities;
      assert.equal(nextState[nextState.length - 1].displayName, '');
      assert.equal(nextState[nextState.length - 1].key, 'key');
    });

    it('update activity field', () => {
      let state = reducer(initialState, updateActivityField(1, 'time', 100));
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            time: 100,
            activitySections: [
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'}
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
        ],
        state.activities
      );
    });

    it('removes activity', () => {
      let state = reducer(initialState, removeActivity(1));
      assert.deepEqual(
        [
          {
            key: 'y',
            displayName: 'Y',
            position: 1,
            activitySections: [
              {key: 'c', position: 1, displayName: 'C'},
              {key: 'd', position: 2, displayName: 'D'}
            ]
          }
        ],
        state.activities
      );
    });

    it('moves activity', () => {
      let state = reducer(initialState, moveActivity(2, 'up'));
      assert.deepEqual(
        [
          {
            key: 'y',
            displayName: 'Y',
            position: 1,
            activitySections: [
              {key: 'c', position: 1, displayName: 'C'},
              {key: 'd', position: 2, displayName: 'D'}
            ]
          },
          {
            key: 'x',
            displayName: 'X',
            position: 2,
            activitySections: [
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'}
            ]
          }
        ],
        state.activities
      );

      state = reducer(state, moveActivity(1, 'down'));
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'}
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
        ],
        state.activities
      );
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
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'}
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {key: 'd', position: 1, displayName: 'D'},
              {key: 'c', position: 2, displayName: 'C'}
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
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'},
              {key: 'd', position: 3, displayName: 'D'}
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [{key: 'c', position: 1, displayName: 'C'}]
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
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'd', position: 2, displayName: 'D'},
              {key: 'b', position: 3, displayName: 'B'}
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [{key: 'c', position: 1, displayName: 'C'}]
          }
        ],
        state.activities,
        'third move changes position but not activity'
      );
    });

    it('remove activity section', () => {
      let state = reducer(initialState, removeActivitySection(1, 2));
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [{key: 'a', position: 1, displayName: 'A'}]
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
        ],
        state.activities
      );
    });

    it('update activity section field', () => {
      let state = reducer(
        initialState,
        updateActivitySectionField(1, 2, 'displayName', 'My Display Name')
      );
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'My Display Name'}
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
        ],
        state.activities
      );
    });

    it('set the activity for an activity section', () => {
      let state = reducer(initialState, setActivity(2, 1, 2));
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [{key: 'a', position: 1, displayName: 'A'}]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {key: 'c', position: 1, displayName: 'C'},
              {key: 'd', position: 2, displayName: 'D'},
              {key: 'b', position: 3, displayName: 'B'}
            ]
          }
        ],
        state.activities
      );
    });
  });

  describe('activity section', () => {
    let initialActivities = [];

    beforeEach(() => {
      initialActivities = [
        {
          key: 'x',
          displayName: 'X',
          position: 1,
          activitySections: [
            {key: 'a', position: 1, displayName: 'A'},
            {key: 'b', position: 2, displayName: 'B'}
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
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'}
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {key: 'd', position: 1, displayName: 'D'},
              {key: 'c', position: 2, displayName: 'C'}
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
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'B'},
              {key: 'd', position: 3, displayName: 'D'}
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [{key: 'c', position: 1, displayName: 'C'}]
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
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'd', position: 2, displayName: 'D'},
              {key: 'b', position: 3, displayName: 'B'}
            ]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [{key: 'c', position: 1, displayName: 'C'}]
          }
        ],
        state.activities,
        'third move changes position but not activity'
      );
    });

    it('remove activity section', () => {
      let state = reducer(initialState, removeActivitySection(1, 2));
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [{key: 'a', position: 1, displayName: 'A'}]
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
        ],
        state.activities
      );
    });

    it('update activity section field', () => {
      let state = reducer(
        initialState,
        updateActivitySectionField(1, 2, 'displayName', 'My Display Name')
      );
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [
              {key: 'a', position: 1, displayName: 'A'},
              {key: 'b', position: 2, displayName: 'My Display Name'}
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
        ],
        state.activities
      );
    });

    it('set the activity for an activity section', () => {
      let state = reducer(initialState, setActivity(2, 1, 2));
      assert.deepEqual(
        [
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            activitySections: [{key: 'a', position: 1, displayName: 'A'}]
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            activitySections: [
              {key: 'c', position: 1, displayName: 'C'},
              {key: 'd', position: 2, displayName: 'D'},
              {key: 'b', position: 3, displayName: 'B'}
            ]
          }
        ],
        state.activities
      );
    });

    it('add activitySection', () => {
      const nextState = reducer(
        initialState,
        addActivitySection(1, 'activitySection-key')
      ).activities;
      assert.deepEqual(nextState[0].activitySections.map(s => s.key), [
        'a',
        'b',
        'activitySection-key'
      ]);
    });
  });
});

import {combineReducers} from 'redux';
import reducers, {
  addActivity,
  moveActivity,
  removeActivity,
  updateActivityField,
  addActivitySection,
  moveActivitySection,
  removeActivitySection,
  updateActivitySectionField,
  addTip,
  updateTip,
  removeTip,
  addLevel,
  removeLevel,
  setScriptLevelField,
  reorderLevel,
  moveLevelToActivitySection,
  emptyActivity,
  emptyActivitySection,
  getSerializedActivities
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {sampleActivities} from './activitiesTestData';
import _ from 'lodash';
import {expect, assert} from '../../../../util/reconfiguredChai';

const getInitialState = () => ({
  activities: _.cloneDeep(sampleActivities)
});

const reducer = combineReducers(reducers);

describe('activitiesEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('getSerializedActivities', () => {
    let serializedActivities = getSerializedActivities(initialState.activities);

    // Verify that the JSON contains serialized activities.
    const activities = JSON.parse(serializedActivities);
    expect(activities.length).to.equal(1);
    expect(activities[0].key).to.equal('activity-1');
    const sections = activities[0].activitySections;
    expect(sections.length).to.equal(3);
    expect(sections[0].key).to.equal('section-3');
  });

  it('add tip', () => {
    const nextState = reducer(
      initialState,
      addTip(1, 2, {
        key: 'new-tip',
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.'
      })
    ).activities;
    assert.deepEqual(nextState[0].activitySections[1].tips.map(s => s.type), [
      'teachingTip',
      'discussionGoal',
      'contentCorner'
    ]);
  });

  it('update tip', () => {
    const nextState = reducer(
      initialState,
      updateTip(1, 2, {
        key: 'tip-1',
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.'
      })
    ).activities;
    assert.deepEqual(nextState[0].activitySections[1].tips, [
      {
        key: 'tip-1',
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.'
      },
      {
        key: 'tip-2',
        markdown: 'Discussion Goal content',
        type: 'discussionGoal'
      }
    ]);
  });

  it('remove tip', () => {
    const nextState = reducer(initialState, removeTip(1, 2, 'tip-1'))
      .activities;
    assert.deepEqual(nextState[0].activitySections[1].tips.map(s => s.type), [
      'discussionGoal'
    ]);
  });

  describe('levels', () => {
    it('reorder levels', () => {
      const nextState = reducer(initialState, reorderLevel(1, 3, 2, 1))
        .activities;
      assert.deepEqual(
        nextState[0].activitySections[2].scriptLevels.map(l => l.id),
        ['11', '10']
      );
    });

    describe('moveLevelToActivitySection', () => {
      beforeEach(() => {
        initialState.activities.push({
          key: 'activity-2',
          displayName: 'Second Activity',
          position: 2,
          duration: 30,
          activitySections: [
            {
              key: 'section-4',
              position: 1,
              displayName: 'Making drawings',
              remarks: true,
              scriptLevels: [],
              text: 'Drawing text',
              tips: []
            }
          ]
        });
      });

      /**
       * Return a 2D array containing a list of active level ids for each
       * activity section in the specified activity.
       */
      const activeLevelIdMap = activity =>
        activity.activitySections.map(section =>
          section.scriptLevels.map(l => l.activeId)
        );

      it('moves level to activitySection within the same activity', () => {
        const oldActivities = initialState.activities;
        assert.deepEqual(
          [[], [], ['1', '2']],
          activeLevelIdMap(oldActivities[0])
        );

        const activityPos = 1;
        const sectionPos = 3;
        const levelPos = 2;
        const newSectionPos = 2;
        const newActivities = reducer(
          initialState,
          moveLevelToActivitySection(
            activityPos,
            sectionPos,
            levelPos,
            activityPos,
            newSectionPos
          )
        ).activities;
        assert.deepEqual(
          [[], ['2'], ['1']],
          activeLevelIdMap(newActivities[0])
        );
      });

      it('moves level to activitySection in a different activity', () => {
        const oldActivities = initialState.activities;
        assert.deepEqual(
          [[], [], ['1', '2']],
          activeLevelIdMap(oldActivities[0])
        );
        assert.deepEqual([[]], activeLevelIdMap(oldActivities[1]));

        const activityPos = 1;
        const sectionPos = 3;
        const levelPos = 2;
        const newActivityPos = 2;
        const newSectionPos = 1;
        const newActivities = reducer(
          initialState,
          moveLevelToActivitySection(
            activityPos,
            sectionPos,
            levelPos,
            newActivityPos,
            newSectionPos
          )
        ).activities;
        assert.deepEqual([[], [], ['1']], activeLevelIdMap(newActivities[0]));
        assert.deepEqual([['2']], activeLevelIdMap(newActivities[1]));
      });
    });

    it('add level', () => {
      const nextState = reducer(
        initialState,
        addLevel(1, 3, {
          id: '12',
          levels: [
            {
              name: 'Level 4',
              id: '4',
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
          position: 4,
          activeId: '4',
          kind: 'puzzle',
          bonus: false,
          assessment: false,
          challenge: false,
          expand: false
        })
      ).activities;
      assert.deepEqual(
        nextState[0].activitySections[2].scriptLevels.map(s => s.id),
        ['10', '11', '12']
      );
    });

    it('remove level', () => {
      const nextState = reducer(initialState, removeLevel(1, 3, 1)).activities;
      assert.deepEqual(
        nextState[0].activitySections[2].scriptLevels.map(s => s.id),
        ['11']
      );
    });

    it('set script level field', () => {
      let nextState = reducer(
        initialState,
        setScriptLevelField(1, 3, 1, {bonus: true})
      );
      assert.equal(
        nextState.activities[0].activitySections[2].scriptLevels[0].bonus,
        true
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
      const nextState = reducer(
        initialState,
        addActivity(3, 'activity-key', 'section-key-1')
      ).activities;
      assert.equal(nextState[nextState.length - 1].displayName, '');
      assert.equal(nextState[nextState.length - 1].key, 'activity-key');
      assert.equal(
        nextState[nextState.length - 1].activitySections[0].key,
        'section-key-1'
      );
    });

    it('update activity field', () => {
      let state = reducer(
        initialState,
        updateActivityField(1, 'duration', 100)
      );

      let expectedState = _.cloneDeep(initialActivities);
      expectedState[0].duration = 100;

      assert.deepEqual(expectedState, state.activities);
    });

    it('removes activity', () => {
      let state = reducer(initialState, removeActivity(1));

      let expectedState = _.cloneDeep(initialActivities).slice(1);
      expectedState[0].position = 1;

      assert.deepEqual(expectedState, state.activities);
    });

    it('removes last activity', () => {
      let state = reducer(initialState, removeActivity(1));
      assert.deepEqual(1, state.activities.length);

      state = reducer(state, removeActivity(1));
      assert.deepEqual(1, state.activities.length);
      assert.deepEqual([emptyActivity], state.activities);
    });

    it('moves activity', () => {
      let state = reducer(initialState, moveActivity(2, 'up'));

      let expectedState = _.cloneDeep(initialActivities).reverse();
      expectedState[0].position = 1;
      expectedState[1].position = 2;

      assert.deepEqual(expectedState, state.activities);

      state = reducer(state, moveActivity(1, 'down'));

      assert.deepEqual(initialActivities, state.activities);
    });

    describe('activity section', () => {
      it('moves a activitySection up and changes position but not activity', () => {
        const key = 'd';
        let activityPosition = findActivityPositionByKey(initialState, key);
        let activitySectionPosition = findActivitySectionPositionByKey(
          initialState,
          activityPosition,
          key
        );
        let state = reducer(
          initialState,
          moveActivitySection(activityPosition, activitySectionPosition, 'up')
        );

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[1].activitySections = expectedState[1].activitySections.reverse();
        expectedState[1].activitySections[0].position = 1;
        expectedState[1].activitySections[1].position = 2;

        assert.deepEqual(expectedState, state.activities);
      });

      it('moves a activitySection up and changes activity but not position', () => {
        const key = 'c';
        let activityPosition = findActivityPositionByKey(initialState, key);
        let activitySectionPosition = findActivitySectionPositionByKey(
          initialState,
          activityPosition,
          key
        );
        let state = reducer(
          initialState,
          moveActivitySection(activityPosition, activitySectionPosition, 'up')
        );

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections.push(
          expectedState[1].activitySections[0]
        );
        expectedState[0].activitySections[2].position = 3;
        expectedState[1].activitySections = expectedState[1].activitySections.slice(
          1
        );
        expectedState[1].activitySections[0].position = 1;

        assert.deepEqual(expectedState, state.activities);
      });

      it('remove activity section', () => {
        let state = reducer(initialState, removeActivitySection(1, 1));

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections = expectedState[0].activitySections.slice(
          1
        );
        expectedState[0].activitySections[0].position = 1;

        assert.deepEqual(expectedState, state.activities);
      });

      it('remove last activity section in activity', () => {
        let state = reducer(initialState, removeActivitySection(1, 1));
        assert.deepEqual(1, state.activities[0].activitySections.length);

        state = reducer(state, removeActivitySection(1, 1));

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections = [emptyActivitySection];

        assert.deepEqual(1, state.activities[0].activitySections.length);
        assert.deepEqual(expectedState, state.activities);
      });

      it('update activity section field', () => {
        let state = reducer(
          initialState,
          updateActivitySectionField(1, 2, 'displayName', 'My Display Name')
        );

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections[1].displayName = 'My Display Name';

        assert.deepEqual(expectedState, state.activities);
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
});

const findActivityPositionByKey = (state, key) => {
  return state.activities.find(activity =>
    activity.activitySections.find(
      activitySection => activitySection.key === key
    )
  ).position;
};

const findActivitySectionPositionByKey = (state, activityPosition, key) => {
  return state.activities[activityPosition - 1].activitySections.find(
    activitySection => activitySection.key === key
  ).position;
};

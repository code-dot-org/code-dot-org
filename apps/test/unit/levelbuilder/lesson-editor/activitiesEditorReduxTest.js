import _ from 'lodash';
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
  getSerializedActivities,
} from '@cdo/apps/levelbuilder/lesson-editor/activitiesEditorRedux';

import {sampleActivities} from './activitiesTestData';

const getInitialState = () => ({
  activities: _.cloneDeep(sampleActivities),
});

const reducer = combineReducers(reducers);

describe('activitiesEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('getSerializedActivities', () => {
    let serializedActivities = getSerializedActivities(initialState.activities);

    // Verify that the JSON contains serialized activities.
    const activities = JSON.parse(serializedActivities);
    expect(activities.length).toBe(1);
    expect(activities[0].key).toBe('activity-1');
    const sections = activities[0].activitySections;
    expect(sections.length).toBe(3);
    expect(sections[0].key).toBe('section-3');
  });

  it('add tip', () => {
    const nextState = reducer(
      initialState,
      addTip(1, 2, {
        key: 'new-tip',
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.',
      })
    ).activities;
    expect(nextState[0].activitySections[1].tips.map(s => s.type)).toEqual([
      'teachingTip',
      'discussionGoal',
      'contentCorner',
    ]);
  });

  it('update tip', () => {
    const nextState = reducer(
      initialState,
      updateTip(1, 2, {
        key: 'tip-1',
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.',
      })
    ).activities;
    expect(nextState[0].activitySections[1].tips).toEqual([
      {
        key: 'tip-1',
        type: 'contentCorner',
        markdown: 'Programming is about solving puzzles.',
      },
      {
        key: 'tip-2',
        markdown: 'Discussion Goal content',
        type: 'discussionGoal',
      },
    ]);
  });

  it('remove tip', () => {
    const nextState = reducer(
      initialState,
      removeTip(1, 2, 'tip-1')
    ).activities;
    expect(nextState[0].activitySections[1].tips.map(s => s.type)).toEqual([
      'discussionGoal',
    ]);
  });

  describe('levels', () => {
    it('reorder levels', () => {
      const nextState = reducer(
        initialState,
        reorderLevel(1, 3, 2, 1)
      ).activities;
      expect(
        nextState[0].activitySections[2].scriptLevels.map(l => l.id)
      ).toEqual(['11', '10']);
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
              tips: [],
            },
          ],
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
        expect([[], [], ['1', '2']]).toEqual(
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
        expect([[], ['2'], ['1']]).toEqual(activeLevelIdMap(newActivities[0]));
      });

      it('moves level to activitySection in a different activity', () => {
        const oldActivities = initialState.activities;
        expect([[], [], ['1', '2']]).toEqual(
          activeLevelIdMap(oldActivities[0])
        );
        expect([[]]).toEqual(activeLevelIdMap(oldActivities[1]));

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
        expect([[], [], ['1']]).toEqual(activeLevelIdMap(newActivities[0]));
        expect([['2']]).toEqual(activeLevelIdMap(newActivities[1]));
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
              conceptDifficulty: '',
            },
          ],
          position: 4,
          activeId: '4',
          kind: 'puzzle',
          bonus: false,
          assessment: false,
          challenge: false,
          expand: false,
        })
      ).activities;
      expect(
        nextState[0].activitySections[2].scriptLevels.map(s => s.id)
      ).toEqual(['10', '11', '12']);
    });

    it('remove level', () => {
      const nextState = reducer(initialState, removeLevel(1, 3, 1)).activities;
      expect(
        nextState[0].activitySections[2].scriptLevels.map(s => s.id)
      ).toEqual(['11']);
    });

    it('set script level field', () => {
      let nextState = reducer(
        initialState,
        setScriptLevelField(1, 3, 1, {bonus: true})
      );
      expect(
        nextState.activities[0].activitySections[2].scriptLevels[0].bonus
      ).toEqual(true);
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
            {key: 'b', position: 2, displayName: 'B'},
          ],
        },
        {
          key: 'y',
          displayName: 'Y',
          position: 2,
          activitySections: [
            {key: 'c', position: 1, displayName: 'C'},
            {key: 'd', position: 2, displayName: 'D'},
          ],
        },
      ];
      initialState.activities = initialActivities;
    });

    it('add activity', () => {
      const nextState = reducer(
        initialState,
        addActivity(3, 'activity-key', 'section-key-1')
      ).activities;
      expect(nextState[nextState.length - 1].displayName).toEqual('');
      expect(nextState[nextState.length - 1].key).toEqual('activity-key');
      expect(nextState[nextState.length - 1].activitySections[0].key).toEqual(
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

      expect(expectedState).toEqual(state.activities);
    });

    it('removes activity', () => {
      let state = reducer(initialState, removeActivity(1));

      let expectedState = _.cloneDeep(initialActivities).slice(1);
      expectedState[0].position = 1;

      expect(expectedState).toEqual(state.activities);
    });

    it('removes last activity', () => {
      let state = reducer(initialState, removeActivity(1));
      expect(1).toEqual(state.activities.length);

      state = reducer(state, removeActivity(1));
      expect(1).toEqual(state.activities.length);
      expect([emptyActivity]).toEqual(state.activities);
    });

    it('moves activity', () => {
      let state = reducer(initialState, moveActivity(2, 'up'));

      let expectedState = _.cloneDeep(initialActivities).reverse();
      expectedState[0].position = 1;
      expectedState[1].position = 2;

      expect(expectedState).toEqual(state.activities);

      state = reducer(state, moveActivity(1, 'down'));

      expect(initialActivities).toEqual(state.activities);
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
        expectedState[1].activitySections =
          expectedState[1].activitySections.reverse();
        expectedState[1].activitySections[0].position = 1;
        expectedState[1].activitySections[1].position = 2;

        expect(expectedState).toEqual(state.activities);
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
        expectedState[1].activitySections =
          expectedState[1].activitySections.slice(1);
        expectedState[1].activitySections[0].position = 1;

        expect(expectedState).toEqual(state.activities);
      });

      it('remove activity section', () => {
        let state = reducer(initialState, removeActivitySection(1, 1));

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections =
          expectedState[0].activitySections.slice(1);
        expectedState[0].activitySections[0].position = 1;

        expect(expectedState).toEqual(state.activities);
      });

      it('remove last activity section in activity', () => {
        let state = reducer(initialState, removeActivitySection(1, 1));
        expect(1).toEqual(state.activities[0].activitySections.length);

        state = reducer(state, removeActivitySection(1, 1));

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections = [emptyActivitySection];

        expect(1).toEqual(state.activities[0].activitySections.length);
        expect(expectedState).toEqual(state.activities);
      });

      it('update activity section field', () => {
        let state = reducer(
          initialState,
          updateActivitySectionField(1, 2, 'displayName', 'My Display Name')
        );

        let expectedState = _.cloneDeep(initialActivities);
        expectedState[0].activitySections[1].displayName = 'My Display Name';

        expect(expectedState).toEqual(state.activities);
      });

      it('add activitySection', () => {
        const nextState = reducer(
          initialState,
          addActivitySection(1, 'activitySection-key')
        ).activities;
        expect(nextState[0].activitySections.map(s => s.key)).toEqual([
          'a',
          'b',
          'activitySection-key',
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

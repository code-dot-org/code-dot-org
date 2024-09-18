import _ from 'lodash';
import {combineReducers} from 'redux';

import reducers, {
  addGroup,
  addLesson,
  setLessonGroup,
  reorderLesson,
  updateLessonGroupField,
  removeGroup,
  emptyNonUserFacingGroup,
  mapLessonGroupDataForEditor,
} from '@cdo/apps/levelbuilder/unit-editor/unitEditorRedux';

const getInitialState = () => ({
  lessonGroups: [
    {
      id: 1,
      key: 'lg-key',
      displayName: 'Display Name',
      description: 'My Description',
      position: 1,
      userFacing: true,
      lessons: [
        {
          id: 100,
          key: 'a',
          name: 'A',
          position: 1,
          unplugged: true,
          levels: [
            {
              activeId: '2001',
              inactiveIds: [],
              ids: ['2001'],
              kind: 'puzzle',
              position: 1,
            },
            {
              activeId: '2002',
              inactiveIds: [],
              ids: ['2002'],
              kind: 'puzzle',
              position: 2,
            },
          ],
          hasLessonPlan: true,
        },
        {
          id: 101,
          key: 'b',
          name: 'B',
          position: 2,
          levels: [],
          hasLessonPlan: false,
        },
        {
          id: 102,
          key: 'c',
          name: 'C',
          position: 3,
          levels: [],
          hasLessonPlan: true,
        },
      ],
    },
    {
      id: 2,
      key: 'lg-key-2',
      displayName: 'Display Name 2',
      position: 2,
      userFacing: true,
      lessons: [
        {
          id: 104,
          key: 'd',
          name: 'D',
          position: 1,
          levels: [],
          hasLessonPlan: true,
        },
        {
          id: 105,
          key: 'e',
          name: 'E',
          position: 2,
          levels: [],
          hasLessonPlan: true,
        },
        {
          id: 106,
          key: 'f',
          name: 'F',
          position: 3,
          levels: [],
          hasLessonPlan: false,
        },
      ],
    },
  ],
});

const reducer = combineReducers(reducers);

describe('unitEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('mapLessonGroupDataForEditor', () => {
    let mappedLessonGroups = mapLessonGroupDataForEditor(
      initialState.lessonGroups
    );

    expect(mappedLessonGroups.length).toBe(2);
    expect(mappedLessonGroups[0].lessons.length).toBe(3);
  });

  it('add group', () => {
    const nextState = reducer(
      initialState,
      addGroup(2, 'key', 'Display Name')
    ).lessonGroups;
    expect(nextState[nextState.length - 1].displayName).toEqual('Display Name');
    expect(nextState[nextState.length - 1].userFacing).toEqual(true);
  });

  it('remove group', () => {
    // Remove lesson group when there are 2 lessons groups
    let nextState = reducer(initialState, removeGroup(1));
    let lessonGroups = nextState.lessonGroups;
    expect(lessonGroups.length).toEqual(1);
    expect(lessonGroups[0].position).toEqual(1);
    expect(lessonGroups[0].key).toEqual('lg-key-2');

    // Remove lesson group when there is only one lesson group left
    // a non-user facing lesson group should be added
    nextState = reducer(nextState, removeGroup(1));
    lessonGroups = nextState.lessonGroups;
    expect(lessonGroups.length).toEqual(1);
    expect(lessonGroups[0].key).toEqual(emptyNonUserFacingGroup.key);
    expect(lessonGroups[0].position).toEqual(1);
    expect(lessonGroups[0].userFacing).toEqual(false);
  });

  it('add lesson', () => {
    const nextState = reducer(
      initialState,
      addLesson(1, 'lesson-new', 'New Lesson 2')
    ).lessonGroups;
    expect(nextState[0].lessons.map(s => s.name)).toEqual([
      'A',
      'B',
      'C',
      'New Lesson 2',
    ]);
  });

  describe('reorderLesson', () => {
    it('move lesson up within first lesson group', () => {
      const nextState = reducer(
        initialState,
        reorderLesson(1, 3, 2)
      ).lessonGroups;
      expect(nextState[0].lessons.map(l => l.key)).toEqual(['a', 'c', 'b']);
    });
    it('move lesson down within first lesson group', () => {
      const nextState = reducer(
        initialState,
        reorderLesson(1, 1, 2)
      ).lessonGroups;
      expect(nextState[0].lessons.map(l => l.key)).toEqual(['b', 'a', 'c']);
    });
    it('move lesson to same position within first lesson group', () => {
      const nextState = reducer(
        initialState,
        reorderLesson(1, 2, 2)
      ).lessonGroups;
      expect(nextState[0].lessons.map(l => l.key)).toEqual(['a', 'b', 'c']);
    });

    it('move lesson up within second lesson group', () => {
      const nextState = reducer(
        initialState,
        reorderLesson(2, 3, 2)
      ).lessonGroups;
      expect(nextState[1].lessons.map(l => l.key)).toEqual(['d', 'f', 'e']);
    });
    it('move lesson to same position within second lesson group', () => {
      const nextState = reducer(
        initialState,
        reorderLesson(2, 2, 2)
      ).lessonGroups;
      expect(nextState[1].lessons.map(l => l.key)).toEqual(['d', 'e', 'f']);
    });
    it('move lesson down within second lesson group', () => {
      const nextState = reducer(
        initialState,
        reorderLesson(2, 1, 2)
      ).lessonGroups;
      expect(nextState[1].lessons.map(l => l.key)).toEqual(['e', 'd', 'f']);
    });
  });

  describe('lesson groups', () => {
    let initialLessonGroups = [];

    beforeEach(() => {
      initialLessonGroups = [
        {
          key: 'x',
          displayName: 'X',
          position: 1,
          lessons: [
            {id: 101, position: 1},
            {id: 102, position: 2},
          ],
        },
        {
          key: 'y',
          displayName: 'Y',
          position: 2,
          lessons: [
            {id: 103, position: 1},
            {id: 104, position: 2},
          ],
        },
      ];
      initialState.lessonGroups = initialLessonGroups;
    });

    it('update lesson group field', () => {
      let state = reducer(
        initialState,
        updateLessonGroupField(1, 'description', 'Overview of the lesson group')
      );

      let expectedState = _.cloneDeep(initialLessonGroups);
      expectedState[0].description = 'Overview of the lesson group';

      expect(expectedState).toEqual(state.lessonGroups);
    });

    describe('set lesson group', () => {
      it('moves unique lesson group to the end of the script', () => {
        let state = reducer(initialState, setLessonGroup(2, 1, 2));
        expect([
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            lessons: [{id: 101, position: 1}],
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            lessons: [
              {id: 103, position: 1},
              {id: 104, position: 2},
              {id: 102, position: 3},
            ],
          },
        ]).toEqual(state.lessonGroups);
      });

      it('groups with others in same lesson group', () => {
        const newState = reducer(initialState, setLessonGroup(2, 2, 1));
        expect([
          {
            key: 'x',
            displayName: 'X',
            position: 1,
            lessons: [
              {id: 101, position: 1},
              {id: 102, position: 2},
              {id: 104, position: 3},
            ],
          },
          {
            key: 'y',
            displayName: 'Y',
            position: 2,
            lessons: [{id: 103, position: 1}],
          },
        ]).toEqual(newState.lessonGroups);
      });
    });
  });
});

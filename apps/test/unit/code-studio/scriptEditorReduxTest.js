import {expect, assert} from '../../util/reconfiguredChai';
import {combineReducers} from 'redux';
import reducers, {
  addGroup,
  addLesson,
  setLessonGroup,
  reorderLesson,
  updateLessonGroupField,
  removeGroup,
  emptyNonUserFacingGroup,
  getSerializedLessonGroups,
  mapLessonGroupDataForEditor
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import _ from 'lodash';

const getInitialState = () => ({
  levelKeyList: {},
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
          levels: [],
          hasLessonPlan: true
        },
        {
          id: 101,
          key: 'b',
          name: 'B',
          position: 2,
          levels: [],
          hasLessonPlan: false
        },
        {
          id: 102,
          key: 'c',
          name: 'C',
          position: 3,
          levels: [],
          hasLessonPlan: true
        }
      ]
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
          hasLessonPlan: true
        },
        {
          id: 105,
          key: 'e',
          name: 'E',
          position: 2,
          levels: [],
          hasLessonPlan: true
        },
        {
          id: 106,
          key: 'f',
          name: 'F',
          position: 3,
          levels: [],
          hasLessonPlan: false
        }
      ]
    }
  ]
});

const reducer = combineReducers(reducers);

describe('scriptEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  describe('getSerializedLessonGroups', () => {
    it('serializes default state', () => {
      let serializedLessonGroups = getSerializedLessonGroups(
        initialState.lessonGroups,
        initialState.levelKeyList
      );

      // Verify that the JSON contains serialized lesson groups.
      expect(serializedLessonGroups).to.equal(
        "lesson_group 'lg-key', display_name: 'Display Name'\n" +
          "lesson_group_description 'My Description'\n" +
          "lesson 'a', display_name: 'A', has_lesson_plan: true, unplugged: true\n\n" +
          "lesson 'b', display_name: 'B', has_lesson_plan: false\n\n" +
          "lesson 'c', display_name: 'C', has_lesson_plan: true\n\n" +
          "lesson_group 'lg-key-2', display_name: 'Display Name 2'\n" +
          "lesson 'd', display_name: 'D', has_lesson_plan: true\n\n" +
          "lesson 'e', display_name: 'E', has_lesson_plan: true\n\n" +
          "lesson 'f', display_name: 'F', has_lesson_plan: false\n\n"
      );
    });

    it('serializes lesson group with single quotes in description', () => {
      initialState.lessonGroups[0].description = "a'b'c'd";
      let serializedLessonGroups = getSerializedLessonGroups(
        initialState.lessonGroups,
        initialState.levelKeyList
      );

      // Verify that the JSON contains serialized lesson groups.
      expect(serializedLessonGroups).to.equal(
        "lesson_group 'lg-key', display_name: 'Display Name'\n" +
          "lesson_group_description 'a\\'b\\'c\\'d'\n" +
          "lesson 'a', display_name: 'A', has_lesson_plan: true, unplugged: true\n\n" +
          "lesson 'b', display_name: 'B', has_lesson_plan: false\n\n" +
          "lesson 'c', display_name: 'C', has_lesson_plan: true\n\n" +
          "lesson_group 'lg-key-2', display_name: 'Display Name 2'\n" +
          "lesson 'd', display_name: 'D', has_lesson_plan: true\n\n" +
          "lesson 'e', display_name: 'E', has_lesson_plan: true\n\n" +
          "lesson 'f', display_name: 'F', has_lesson_plan: false\n\n"
      );
    });
  });

  it('mapLessonGroupDataForEditor', () => {
    let mappedLessonGroups = mapLessonGroupDataForEditor(
      initialState.lessonGroups
    );

    expect(mappedLessonGroups.length).to.equal(2);
    expect(mappedLessonGroups[0].lessons.length).to.equal(3);
    expect(mappedLessonGroups[0].lessons[0].levels.length).to.equal(0);
  });

  it('add group', () => {
    const nextState = reducer(initialState, addGroup(2, 'key', 'Display Name'))
      .lessonGroups;
    assert.equal(nextState[nextState.length - 1].displayName, 'Display Name');
    assert.equal(nextState[nextState.length - 1].userFacing, true);
  });

  it('remove group', () => {
    // Remove lesson group when there are 2 lessons groups
    let nextState = reducer(initialState, removeGroup(1));
    let lessonGroups = nextState.lessonGroups;
    assert.equal(lessonGroups.length, 1);
    assert.equal(lessonGroups[0].position, 1);
    assert.equal(lessonGroups[0].key, 'lg-key-2');

    // Remove lesson group when there is only one lesson group left
    // a non-user facing lesson group should be added
    nextState = reducer(nextState, removeGroup(1));
    lessonGroups = nextState.lessonGroups;
    assert.equal(lessonGroups.length, 1);
    assert.equal(lessonGroups[0].key, emptyNonUserFacingGroup.key);
    assert.equal(lessonGroups[0].position, 1);
    assert.equal(lessonGroups[0].userFacing, false);
  });

  it('add lesson', () => {
    const nextState = reducer(
      initialState,
      addLesson(1, 'lesson-new', 'New Lesson 2')
    ).lessonGroups;
    assert.deepEqual(nextState[0].lessons.map(s => s.name), [
      'A',
      'B',
      'C',
      'New Lesson 2'
    ]);
  });

  describe('reorderLesson', () => {
    it('move lesson up within first lesson group', () => {
      const nextState = reducer(initialState, reorderLesson(1, 3, 2))
        .lessonGroups;
      assert.deepEqual(nextState[0].lessons.map(l => l.key), ['a', 'c', 'b']);
    });
    it('move lesson down within first lesson group', () => {
      const nextState = reducer(initialState, reorderLesson(1, 1, 2))
        .lessonGroups;
      assert.deepEqual(nextState[0].lessons.map(l => l.key), ['b', 'a', 'c']);
    });
    it('move lesson to same position within first lesson group', () => {
      const nextState = reducer(initialState, reorderLesson(1, 2, 2))
        .lessonGroups;
      assert.deepEqual(nextState[0].lessons.map(l => l.key), ['a', 'b', 'c']);
    });

    it('move lesson up within second lesson group', () => {
      const nextState = reducer(initialState, reorderLesson(2, 3, 2))
        .lessonGroups;
      assert.deepEqual(nextState[1].lessons.map(l => l.key), ['d', 'f', 'e']);
    });
    it('move lesson to same position within second lesson group', () => {
      const nextState = reducer(initialState, reorderLesson(2, 2, 2))
        .lessonGroups;
      assert.deepEqual(nextState[1].lessons.map(l => l.key), ['d', 'e', 'f']);
    });
    it('move lesson down within second lesson group', () => {
      const nextState = reducer(initialState, reorderLesson(2, 1, 2))
        .lessonGroups;
      assert.deepEqual(nextState[1].lessons.map(l => l.key), ['e', 'd', 'f']);
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
          lessons: [{id: 101, position: 1}, {id: 102, position: 2}]
        },
        {
          key: 'y',
          displayName: 'Y',
          position: 2,
          lessons: [{id: 103, position: 1}, {id: 104, position: 2}]
        }
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

      assert.deepEqual(expectedState, state.lessonGroups);
    });

    describe('set lesson group', () => {
      it('moves unique lesson group to the end of the script', () => {
        let state = reducer(initialState, setLessonGroup(2, 1, 2));
        assert.deepEqual(
          [
            {
              key: 'x',
              displayName: 'X',
              position: 1,
              lessons: [{id: 101, position: 1}]
            },
            {
              key: 'y',
              displayName: 'Y',
              position: 2,
              lessons: [
                {id: 103, position: 1},
                {id: 104, position: 2},
                {id: 102, position: 3}
              ]
            }
          ],
          state.lessonGroups
        );
      });

      it('groups with others in same lesson group', () => {
        const newState = reducer(initialState, setLessonGroup(2, 2, 1));
        assert.deepEqual(
          [
            {
              key: 'x',
              displayName: 'X',
              position: 1,
              lessons: [
                {id: 101, position: 1},
                {id: 102, position: 2},
                {id: 104, position: 3}
              ]
            },
            {
              key: 'y',
              displayName: 'Y',
              position: 2,
              lessons: [{id: 103, position: 1}]
            }
          ],
          newState.lessonGroups
        );
      });
    });
  });
});

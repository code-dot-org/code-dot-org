import {assert} from 'chai';
import {combineReducers} from 'redux';
import reducers, {
  reorderLevel,
  moveLevelToLesson,
  addGroup,
  addLesson,
  moveLesson,
  setActiveVariant,
  setField,
  setLessonGroup
} from '@cdo/apps/lib/levelbuilder/script-editor/editorRedux';

const getInitialState = () => ({
  levelKeyList: {},
  lessonGroups: [
    {
      key: 'lg-key',
      display_name: 'Display Name',
      position: 1,
      user_facing: false,
      lessons: [
        {
          id: 100,
          name: 'A',
          position: 1,
          levels: [
            {
              ids: [1],
              position: 1,
              activeId: 1
            },
            {
              ids: [4],
              position: 2,
              activeId: 4
            },
            {
              ids: [5],
              position: 3,
              activeId: 5
            },
            {
              ids: [6],
              position: 4,
              activeId: 6
            }
          ]
        },
        {
          name: 'B',
          id: 101,
          position: 2,
          levels: [
            {
              ids: [2, 3],
              position: 1,
              activeId: 3
            }
          ]
        }
      ]
    }
  ]
});

const reducer = combineReducers(reducers);

describe('editorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('reorder levels', () => {
    const nextState = reducer(initialState, reorderLevel(1, 1, 3, 1))
      .lessonGroups;
    assert.deepEqual(nextState[0].lessons[0].levels.map(l => l.activeId), [
      5,
      1,
      4,
      6
    ]);
  });
  it('moves level to lesson', () => {
    const nextState = reducer(initialState, moveLevelToLesson(1, 1, 3, 2))
      .lessonGroups;
    assert.deepEqual(nextState[0].lessons[0].levels.map(l => l.activeId), [
      1,
      4,
      6
    ]);
    assert.deepEqual(nextState[0].lessons[1].levels.map(l => l.activeId), [
      3,
      5
    ]);
  });
  it('add group', () => {
    const nextState = reducer(initialState, addGroup(2, 'key', 'Display Name'))
      .lessonGroups;
    assert.equal(nextState[nextState.length - 1].display_name, 'Display Name');
  });
  it('add lesson', () => {
    const nextState = reducer(initialState, addLesson(1, 'New Lesson 2'))
      .lessonGroups;
    assert.deepEqual(nextState[0].lessons.map(s => s.name), [
      'A',
      'B',
      'New Lesson 2'
    ]);
  });
  it('set active variant', () => {
    const nextState = reducer(initialState, setActiveVariant(1, 2, 1, 2))
      .lessonGroups;
    assert.equal(nextState[0].lessons[1].levels[0].activeId, 2);
  });
  it('set level field', () => {
    let nextState = reducer(initialState, setField(1, 1, 1, {videoKey: '_a_'}));
    assert.equal(
      nextState.lessonGroups[0].lessons[0].levels[0].videoKey,
      '_a_'
    );
    nextState = reducer(nextState, setField(1, 1, 1, {skin: '_b_'}));
    assert.equal(nextState.lessonGroups[0].lessons[0].levels[0].skin, '_b_');
    nextState = reducer(
      nextState,
      setField(1, 1, 1, {conceptDifficulty: '_c_'})
    );
    assert.equal(
      nextState.lessonGroups[0].lessons[0].levels[0].conceptDifficulty,
      '_c_'
    );
    nextState = reducer(nextState, setField(1, 1, 1, {concepts: '_d_'}));
    assert.equal(
      nextState.lessonGroups[0].lessons[0].levels[0].concepts,
      '_d_'
    );
  });

  describe('lesson groups', () => {
    let initialLessonGroups = [];

    beforeEach(() => {
      initialLessonGroups = [
        {
          key: 'x',
          display_name: 'X',
          position: 1,
          lessons: [
            {id: 101, position: 1, relativePosition: 1},
            {id: 102, position: 2, relativePosition: 2}
          ]
        },
        {
          key: 'y',
          display_name: 'Y',
          position: 2,
          lessons: [
            {id: 103, position: 3, relativePosition: 3},
            {id: 104, position: 4, relativePosition: 4}
          ]
        }
      ];
      initialState.lessonGroups = initialLessonGroups;
    });

    it('moves a lesson up three times', () => {
      const id = 104;
      let groupPosition = initialState.lessonGroups.find(lessonGroup =>
        lessonGroup.lessons.find(lesson => lesson.id === id)
      ).position;
      let lessonPosition = initialState.lessonGroups[
        groupPosition - 1
      ].lessons.find(lesson => lesson.id === id).position;
      let state = reducer(
        initialState,
        moveLesson(groupPosition, lessonPosition, 'up')
      );
      assert.deepEqual(
        [
          {
            key: 'x',
            display_name: 'X',
            position: 1,
            lessons: [
              {id: 101, position: 1, relativePosition: 1},
              {id: 102, position: 2, relativePosition: 2}
            ]
          },
          {
            key: 'y',
            display_name: 'Y',
            position: 2,
            lessons: [
              {id: 104, position: 3, relativePosition: 3},
              {id: 103, position: 4, relativePosition: 4}
            ]
          }
        ],
        state.lessonGroups,
        'first move changes position but not group'
      );

      groupPosition = state.lessonGroups.find(lessonGroup =>
        lessonGroup.lessons.find(lesson => lesson.id === id)
      ).position;
      lessonPosition = state.lessonGroups[groupPosition - 1].lessons.find(
        lesson => lesson.id === id
      ).position;
      state = reducer(state, moveLesson(groupPosition, lessonPosition, 'up'));
      assert.deepEqual(
        [
          {
            key: 'x',
            display_name: 'X',
            position: 1,
            lessons: [
              {id: 101, position: 1, relativePosition: 1},
              {id: 102, position: 2, relativePosition: 2},
              {id: 104, position: 3, relativePosition: 3}
            ]
          },
          {
            key: 'y',
            display_name: 'Y',
            position: 2,
            lessons: [{id: 103, position: 4, relativePosition: 4}]
          }
        ],
        state.lessonGroups,
        'second move changes group but not position'
      );

      groupPosition = state.lessonGroups.find(lessonGroup =>
        lessonGroup.lessons.find(lesson => lesson.id === id)
      ).position;
      lessonPosition = state.lessonGroups[groupPosition - 1].lessons.find(
        lesson => lesson.id === id
      ).position;
      state = reducer(state, moveLesson(groupPosition, lessonPosition, 'up'));
      assert.deepEqual(
        [
          {
            key: 'x',
            display_name: 'X',
            position: 1,
            lessons: [
              {id: 101, position: 1, relativePosition: 1},
              {id: 104, position: 2, relativePosition: 2},
              {id: 102, position: 3, relativePosition: 3}
            ]
          },
          {
            key: 'y',
            display_name: 'Y',
            position: 2,
            lessons: [{id: 103, position: 4, relativePosition: 4}]
          }
        ],
        state.lessonGroups,
        'third move changes position but not group'
      );
    });

    describe('set lesson group', () => {
      it('moves unique lesson group to the end of the script', () => {
        let state = reducer(initialState, setLessonGroup(2, 1, 2));
        assert.deepEqual(
          [
            {
              key: 'x',
              display_name: 'X',
              position: 1,
              lessons: [{id: 101, position: 1, relativePosition: 1}]
            },
            {
              key: 'y',
              display_name: 'Y',
              position: 2,
              lessons: [
                {id: 103, position: 2, relativePosition: 2},
                {id: 104, position: 3, relativePosition: 3},
                {id: 102, position: 4, relativePosition: 4}
              ]
            }
          ],
          state.lessonGroups
        );
      });

      it('groups with others in same lesson group', () => {
        const newState = reducer(initialState, setLessonGroup(4, 2, 1));
        assert.deepEqual(
          [
            {
              key: 'x',
              display_name: 'X',
              position: 1,
              lessons: [
                {id: 101, position: 1, relativePosition: 1},
                {id: 102, position: 2, relativePosition: 2},
                {id: 104, position: 3, relativePosition: 3}
              ]
            },
            {
              key: 'y',
              display_name: 'Y',
              position: 2,
              lessons: [{id: 103, position: 4, relativePosition: 4}]
            }
          ],
          newState.lessonGroups
        );
      });
    });
  });
});

import {assert} from 'chai';
import {combineReducers} from 'redux';
import reducers, {
  reorderLevel,
  addGroup,
  addStage,
  moveStage,
  setActiveVariant,
  setField,
  setFlexCategory
} from '@cdo/apps/lib/script-editor/editorRedux';

const getInitialState = () => ({
  levelKeyList: {},
  stages: [
    {
      id: 100,
      name: 'A',
      levels: [
        {
          ids: [1],
          activeId: 1
        },
        {
          ids: [4],
          activeId: 4
        },
        {
          ids: [5],
          activeId: 5
        },
        {
          ids: [6],
          activeId: 6
        }
      ]
    },
    {
      name: 'B',
      id: 101,
      levels: [
        {
          ids: [2, 3],
          activeId: 3
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
    const nextState = reducer(initialState, reorderLevel(1, 3, 1)).stages;
    assert.deepEqual(nextState[0].levels.map(l => l.activeId), [5, 1, 4, 6]);
  });
  it('add group', () => {
    const nextState = reducer(
      initialState,
      addGroup('New Stage 1', 'New Group')
    ).stages;
    assert.equal(nextState[nextState.length - 1].name, 'New Stage 1');
  });
  it('add stage', () => {
    const nextState = reducer(initialState, addStage(1, 'New Stage 2')).stages;
    assert.deepEqual(nextState.map(s => s.name), ['A', 'New Stage 2', 'B']);
  });
  it('set active variant', () => {
    const nextState = reducer(initialState, setActiveVariant(2, 1, 2)).stages;
    assert.equal(nextState[1].levels[0].activeId, 2);
  });
  it('set level field', () => {
    let nextState = reducer(initialState, setField(1, 1, {videoKey: '_a_'}));
    assert.equal(nextState.stages[0].levels[0].videoKey, '_a_');
    nextState = reducer(nextState, setField(1, 1, {skin: '_b_'}));
    assert.equal(nextState.stages[0].levels[0].skin, '_b_');
    nextState = reducer(nextState, setField(1, 1, {conceptDifficulty: '_c_'}));
    assert.equal(nextState.stages[0].levels[0].conceptDifficulty, '_c_');
    nextState = reducer(nextState, setField(1, 1, {concepts: '_d_'}));
    assert.equal(nextState.stages[0].levels[0].concepts, '_d_');
  });

  describe('flex categories', () => {
    let initialStages = [];

    beforeEach(() => {
      initialStages = [
        {flex_category: 'X', id: 101, position: 1, relativePosition: 1},
        {flex_category: 'X', id: 102, position: 2, relativePosition: 2},
        {flex_category: 'Y', id: 103, position: 3, relativePosition: 3},
        {flex_category: 'Y', id: 104, position: 4, relativePosition: 4}
      ];
      initialState.stages = initialStages;
    });

    it('moves a stage up three times', () => {
      const id = 104;
      let position = initialState.stages.find(s => s.id === id).position;
      let state = reducer(initialState, moveStage(position, 'up'));
      assert.deepEqual(
        [
          {flex_category: 'X', id: 101, position: 1, relativePosition: 1},
          {flex_category: 'X', id: 102, position: 2, relativePosition: 2},
          {flex_category: 'Y', id: 104, position: 3, relativePosition: 3},
          {flex_category: 'Y', id: 103, position: 4, relativePosition: 4}
        ],
        state.stages,
        'first move changes position but not group'
      );

      position = state.stages.find(s => s.id === id).position;
      state = reducer(state, moveStage(position, 'up'));
      assert.deepEqual(
        [
          {flex_category: 'X', id: 101, position: 1, relativePosition: 1},
          {flex_category: 'X', id: 102, position: 2, relativePosition: 2},
          {flex_category: 'X', id: 104, position: 3, relativePosition: 3},
          {flex_category: 'Y', id: 103, position: 4, relativePosition: 4}
        ],
        state.stages,
        'second move changes group but not position'
      );

      position = state.stages.find(s => s.id === id).position;
      state = reducer(state, moveStage(position, 'up'));
      assert.deepEqual(
        [
          {flex_category: 'X', id: 101, position: 1, relativePosition: 1},
          {flex_category: 'X', id: 104, position: 2, relativePosition: 2},
          {flex_category: 'X', id: 102, position: 3, relativePosition: 3},
          {flex_category: 'Y', id: 103, position: 4, relativePosition: 4}
        ],
        state.stages,
        'third move changes group but not position'
      );
    });

    describe('set flex category', () => {
      it('moves unique flex category to the end of the script', () => {
        let state = reducer(initialState, setFlexCategory(2, 'Z'));
        assert.deepEqual(
          [
            {flex_category: 'X', id: 101, position: 1, relativePosition: 1},
            {flex_category: 'Y', id: 103, position: 2, relativePosition: 2},
            {flex_category: 'Y', id: 104, position: 3, relativePosition: 3},
            {flex_category: 'Z', id: 102, position: 4, relativePosition: 4}
          ],
          state.stages
        );
      });

      it('groups with others in same flex category', () => {
        const newState = reducer(initialState, setFlexCategory(4, 'X'));
        assert.deepEqual(
          [
            {flex_category: 'X', id: 101, position: 1, relativePosition: 1},
            {flex_category: 'X', id: 102, position: 2, relativePosition: 2},
            {flex_category: 'X', id: 104, position: 3, relativePosition: 3},
            {flex_category: 'Y', id: 103, position: 4, relativePosition: 4}
          ],
          newState.stages
        );
      });
    });
  });
});

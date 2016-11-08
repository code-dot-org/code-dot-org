import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import reducer, {
  reorderLevel,
  addGroup,
  addStage
} from '@cdo/apps/sites/studio/pages/components/editorRedux';

const initialState = {
  levelKeyList: {},
  stages: [{
    id: 100,
    name: 'A',
    levels: [{
      ids: [1],
      activeId: 1
    }, {
      ids: [4],
      activeId: 4
    }, {
      ids: [5],
      activeId: 5
    }, {
      ids: [6],
      activeId: 6
    }]
  }, {
    name: 'B',
    id: 101,
    levels: [{
      ids: [2, 3],
      activeId: 3
    }]
  }]
};

describe('editorRedux reducer tests', () => {
  it('reorder levels', () => {
    const nextState = reducer(initialState, reorderLevel(1, 3, 1)).stages;
    assert.deepEqual(nextState[0].levels.map(l => l.activeId), [5, 1, 4, 6]);
  });
  it('add group', () => {
    const nextState = reducer(initialState, addGroup('New Stage 1', 'New Group')).stages;
    assert.equal(nextState[nextState.length - 1].name, 'New Stage 1');
  });
  it('add stage', () => {
    const nextState = reducer(initialState, addStage(1, 'New Stage 2')).stages;
    assert.deepEqual(nextState.map(s => s.name), ['A', 'New Stage 2', 'B']);
  });
});

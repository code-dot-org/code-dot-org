import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import reducer from '@cdo/apps/sites/studio/pages/components/editorRedux';

const initialState = [{
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
}];

describe('editorRedux reducer tests', () => {
  it('reorder levels', () => {
    const nextState = reducer(initialState, {type: 'REORDER_LEVEL', stage: 1, originalPosition: 3, newPosition: 1});
    assert.deepEqual(nextState[0].levels.map(l => l.activeId), [5, 1, 4, 6]);
  });
  it('add group', () => {
    const nextState = reducer([], {type: 'ADD_GROUP', stageName: 'New Stage', groupName: 'New Group'});
    assert.equal(nextState.length, 1);
  });
  it('add stage', () => {
    const nextState = reducer(initialState, {type: 'ADD_STAGE', position: 1, stageName: 'New Stage'});
    assert.deepEqual(nextState.map(s => s.name), ['A', 'New Stage', 'B']);
  });
});

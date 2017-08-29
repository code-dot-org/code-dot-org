import { assert } from 'chai';
import reducer, { ViewType, setViewType } from '@cdo/apps/code-studio/viewAsRedux';
import {stubRedux, restoreRedux, registerReducers, getStore} from '@cdo/apps/redux';

describe('viewAs redux', () => {
  // Create a store so that we get the benefits of our thunk middleware
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({viewAs: reducer});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  it('can set as teacher', () => {
    const action = setViewType(ViewType.Teacher);
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Teacher);
  });

  it('can set as student', () => {
    const action = setViewType(ViewType.Student);
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Student);
  });
});

import {assert} from 'chai';
import {stub} from 'sinon';
import reducer, { ViewType, setViewType } from '@cdo/apps/code-studio/viewAsRedux';
import {stubRedux, restoreRedux, registerReducers, getStore} from '@cdo/apps/redux';
import * as appsUtils from '@cdo/apps/utils';
import * as codeStudioUtils from '@cdo/apps/code-studio/utils';

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

  it('does not allow for invalid view types', () => {
    const action = setViewType('Invalid');
    assert.throws(() => {
      store.dispatch(action);
    });
  });

  describe('with stubs', () => {
    before(() => {
      stub(appsUtils, 'reload');
      stub(codeStudioUtils, 'queryParams').callsFake(() => 'fake_user_id');
      stub(codeStudioUtils, 'updateQueryParam');
    });

    after(() => {
      appsUtils.reload.restore();
      codeStudioUtils.queryParams.restore();
      codeStudioUtils.updateQueryParam.restore();
    });

    it('changes the window location when changing to Student with user_id', () => {
      const action = setViewType(ViewType.Student);
      store.dispatch(action);
      assert(codeStudioUtils.queryParams.calledWith('user_id'));
      assert(codeStudioUtils.updateQueryParam.calledWith('user_id', undefined));
      assert(appsUtils.reload.called);
    });
  });
});

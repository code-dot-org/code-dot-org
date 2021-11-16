import {assert} from 'chai';
import sinon, {stub} from 'sinon';
import reducer, {
  ViewType,
  changeViewType
} from '@cdo/apps/code-studio/viewAsRedux';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore
} from '@cdo/apps/redux';
import * as appsUtils from '@cdo/apps/utils';
import * as codeStudioUtils from '@cdo/apps/code-studio/utils';
import {expect} from '../../util/reconfiguredChai';

describe('viewAs redux', () => {
  // Create a store so that we get the benefits of our thunk middleware
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({viewAs: reducer});
    store = getStore();

    sinon.stub(codeStudioUtils, 'updateQueryParam');
  });

  afterEach(() => {
    codeStudioUtils.updateQueryParam.restore();
    restoreRedux();
  });

  it('can set as teacher', () => {
    const action = changeViewType(ViewType.Teacher);
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Teacher);
  });

  it('setting instructor redirects to teacher', () => {
    const action = changeViewType('Instructor');
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Teacher);
    expect(
      codeStudioUtils.updateQueryParam
    ).to.have.been.calledOnce.and.calledWith('viewAs', 'Teacher');
  });

  it('can set as student', () => {
    const action = changeViewType(ViewType.Student);
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Student);
  });

  it('setting participant redirects to student', () => {
    const action = changeViewType('Participant');
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Student);
    expect(
      codeStudioUtils.updateQueryParam
    ).to.have.been.calledOnce.and.calledWith('viewAs', 'Student');
  });

  it('does not allow for invalid view types', () => {
    const action = changeViewType('Invalid');
    assert.throws(() => {
      store.dispatch(action);
    });
  });

  describe('with stubs', () => {
    before(() => {
      stub(appsUtils, 'reload');
      stub(codeStudioUtils, 'queryParams').callsFake(() => 'fake_user_id');
    });

    after(() => {
      appsUtils.reload.restore();
      codeStudioUtils.queryParams.restore();
      codeStudioUtils.updateQueryParam.restore();
    });

    it('changes the window location when changing to Student with user_id', () => {
      const action = changeViewType(ViewType.Student);
      store.dispatch(action);
      assert(codeStudioUtils.queryParams.calledWith('user_id'));
      assert(codeStudioUtils.updateQueryParam.calledWith('user_id', undefined));
      assert(appsUtils.reload.called);
    });
  });
});

import {assert} from 'chai';
import sinon, {stub} from 'sinon';
import reducer, {
  ViewType,
  changeViewType,
} from '@cdo/apps/code-studio/viewAsRedux';
import {
  __testing_stubRedux,
  __testing_restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import * as appsUtils from '@cdo/apps/utils';
import * as codeStudioUtils from '@cdo/apps/code-studio/utils';
import {expect} from '../../util/reconfiguredChai';

describe('viewAs redux', () => {
  // Create a store so that we get the benefits of our thunk middleware
  let store;
  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({viewAs: reducer});
    store = getStore();

    sinon.stub(codeStudioUtils, 'updateQueryParam');
  });

  afterEach(() => {
    codeStudioUtils.updateQueryParam.restore();
    __testing_restoreRedux();
  });

  it('can set as instructor', () => {
    const action = changeViewType(ViewType.Instructor);
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Instructor);
  });

  it('setting teacher redirects to instructor', () => {
    const action = changeViewType('Teacher');
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Instructor);
    expect(
      codeStudioUtils.updateQueryParam
    ).to.have.been.calledOnce.and.calledWith('viewAs', 'Instructor');
  });

  it('can set as participant', () => {
    const action = changeViewType(ViewType.Participant);
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Participant);
  });

  it('setting student redirects to participant', () => {
    const action = changeViewType('Student');
    store.dispatch(action);
    const nextState = store.getState();
    assert.equal(nextState.viewAs, ViewType.Participant);
    expect(
      codeStudioUtils.updateQueryParam
    ).to.have.been.calledOnce.and.calledWith('viewAs', 'Participant');
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
    });

    it('changes the window location when changing to particpant with user_id', () => {
      const action = changeViewType(ViewType.Participant);
      store.dispatch(action);
      assert(codeStudioUtils.queryParams.calledWith('user_id'));
      assert(codeStudioUtils.updateQueryParam.calledWith('user_id', undefined));
      assert(appsUtils.reload.called);
    });
  });
});

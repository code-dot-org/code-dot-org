/** @file Tests for share dialog redux module */
import {expect} from '../../../util/reconfiguredChai';
import reducer, * as shareDialog from '@cdo/apps/code-studio/components/shareDialogRedux';

describe('Share dialog redux module', () => {
  let originalState = {
    isOpen: false,
    isUnpublishPending: false,
    didUnpublish: false
  };

  const UNPUBLISH_REQUEST = 'shareDialog/UNPUBLISH_REQUEST';
  const UNPUBLISH_SUCCESS = 'shareDialog/UNPUBLISH_SUCCESS';
  const UNPUBLISH_FAILURE = 'shareDialog/UNPUBLISH_FAILURE';

  it('has expected default state', () => {
    expect(reducer(undefined, {})).to.deep.equal(originalState);
  });

  it('returns default state when a nonrecognized action is applied', () => {
    expect(reducer(undefined, {type: 'fakeAction'})).to.deep.equal(
      originalState
    );
  });

  it('showShareDialog sets isOpen to true', () => {
    expect(reducer(undefined, shareDialog.showShareDialog())).to.deep.equal({
      ...originalState,
      ...{isOpen: true}
    });
  });

  it('showShareDialog sets unpublish values to false', () => {
    expect(
      reducer(
        {isUnpublishPending: true, didUnpublish: true},
        shareDialog.showShareDialog()
      )
    ).to.deep.equal({...originalState, ...{isOpen: true}});
  });

  it('hideShareDialog sets isOpen to false', () => {
    expect(
      reducer({isOpen: true}, shareDialog.hideShareDialog())
    ).to.deep.equal(originalState);
  });

  it('hideShareDialog sets unpublish values to false', () => {
    expect(
      reducer(
        {isOpen: true, isUnpublishPending: true, didUnpublish: true},
        shareDialog.hideShareDialog()
      )
    ).to.deep.equal(originalState);
  });

  it('unpublish project sets isUnpublishPending to true', () => {
    console.log(UNPUBLISH_REQUEST);
    expect(reducer(undefined, {type: UNPUBLISH_REQUEST})).to.deep.equal({
      ...originalState,
      ...{isUnpublishPending: true}
    });
  });

  it('unpublish project only changes isUnpublishPending', () => {
    expect(reducer({isOpen: true}, {type: UNPUBLISH_REQUEST})).to.deep.equal({
      isOpen: true,
      isUnpublishPending: true
    });
  });

  it('unpublish success changes publish values to original state', () => {
    expect(
      reducer(
        {isOpen: true, isUnpublishPending: true, didUnpublish: false},
        {type: UNPUBLISH_SUCCESS}
      )
    ).to.deep.equal({...originalState, ...{didUnpublish: true}});
  });

  it('unpublish fail changes only isUnpublishPending', () => {
    let state = {isOpen: true, isUnpublishPending: true, didUnpublish: true};
    expect(reducer(state, {type: UNPUBLISH_FAILURE})).to.deep.equal({
      ...state,
      ...{isUnpublishPending: false}
    });
  });

  it('saveReplayLog sets the changes only the replay log', () => {
    let state = {isOpen: true, isUnpublishPending: true, didUnpublish: true};
    let testLog = 'test';
    expect(reducer(state, shareDialog.saveReplayLog(testLog))).to.deep.equal({
      ...state,
      ...{replayLog: testLog}
    });
  });
});

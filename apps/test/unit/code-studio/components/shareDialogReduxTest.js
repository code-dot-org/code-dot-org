/** @file Tests for share dialog redux module */
import {expect} from '../../../util/reconfiguredChai';
import reducer, * as shareDialog from '@cdo/apps/code-studio/components/shareDialogRedux';

describe('Share dialog redux module', () => {
  let originalState = {
    isOpen: false,
    isUnpublishPending: false,
    didUnpublish: false,
    libraryDialogIsOpen: false
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

  it('showShareDialog sets other values to their initial state', () => {
    expect(
      reducer(
        {
          isUnpublishPending: true,
          didUnpublish: true,
          libraryDialogIsOpen: true
        },
        shareDialog.showShareDialog()
      )
    ).to.deep.equal({...originalState, ...{isOpen: true}});
  });

  it('hideShareDialog sets isOpen to false', () => {
    expect(
      reducer({isOpen: true}, shareDialog.hideShareDialog()).isOpen
    ).to.equal(false);
  });

  it('hideShareDialog sets unpublish values to false', () => {
    expect(
      reducer(
        {isOpen: true, isUnpublishPending: true, didUnpublish: true},
        shareDialog.hideShareDialog()
      )
    ).to.deep.equal({
      isOpen: false,
      isUnpublishPending: false,
      didUnpublish: false
    });
  });

  it('hideShareDialog leaves libraryDialogIsOpen unchanged', () => {
    expect(
      reducer(
        {isOpen: true, libraryDialogIsOpen: true},
        shareDialog.hideShareDialog()
      ).libraryDialogIsOpen
    ).to.be.true;
  });

  it('unpublish project sets isUnpublishPending to true', () => {
    expect(reducer(undefined, {type: UNPUBLISH_REQUEST}).isUnpublishPending).to
      .be.true;
  });

  it('unpublish project only changes isUnpublishPending', () => {
    let state = {isOpen: true, libraryDialogIsOpen: true};
    expect(reducer(state, {type: UNPUBLISH_REQUEST})).to.deep.equal({
      ...state,
      isUnpublishPending: true
    });
  });

  it('unpublish success changes publish values to original state', () => {
    let result = reducer(
      {isOpen: true, isUnpublishPending: true, didUnpublish: false},
      {type: UNPUBLISH_SUCCESS}
    );
    expect(result.isOpen).to.be.false;
    expect(result.isUnpublishPending).to.be.false;
    expect(result.didUnpublish).to.be.true;
  });

  it('unpublish success leaves libraryDialogIsOpen unchanged', () => {
    expect(
      reducer({libraryDialogIsOpen: true}, {type: UNPUBLISH_SUCCESS})
        .libraryDialogIsOpen
    ).to.be.true;
  });

  it('unpublish fail changes only isUnpublishPending', () => {
    let state = {
      isOpen: true,
      isUnpublishPending: true,
      didUnpublish: true,
      libraryDialogIsOpen: true
    };
    expect(reducer(state, {type: UNPUBLISH_FAILURE})).to.deep.equal({
      ...state,
      ...{isUnpublishPending: false}
    });
  });

  it('saveReplayLog sets the changes only the replay log', () => {
    let state = {
      isOpen: true,
      isUnpublishPending: true,
      didUnpublish: true,
      libraryDialogIsOpen: true
    };
    let testLog = 'test';
    expect(reducer(state, shareDialog.saveReplayLog(testLog))).to.deep.equal({
      ...state,
      ...{replayLog: testLog}
    });
  });
});

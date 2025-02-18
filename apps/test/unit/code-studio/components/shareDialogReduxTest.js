/** @file Tests for share dialog redux module */
import reducer, * as shareDialog from '@cdo/apps/code-studio/components/shareDialogRedux';

describe('Share dialog redux module', () => {
  let originalState = {
    isOpen: false,
    isUnpublishPending: false,
    didUnpublish: false,
    libraryDialogIsOpen: false,
  };

  const UNPUBLISH_REQUEST = 'shareDialog/UNPUBLISH_REQUEST';
  const UNPUBLISH_SUCCESS = 'shareDialog/UNPUBLISH_SUCCESS';
  const UNPUBLISH_FAILURE = 'shareDialog/UNPUBLISH_FAILURE';

  it('has expected default state', () => {
    expect(reducer(undefined, {})).toEqual(originalState);
  });

  it('returns default state when a nonrecognized action is applied', () => {
    expect(reducer(undefined, {type: 'fakeAction'})).toEqual(originalState);
  });

  it('showShareDialog sets isOpen to true', () => {
    expect(reducer(undefined, shareDialog.showShareDialog())).toEqual({
      ...originalState,
      ...{isOpen: true},
    });
  });

  it('showShareDialog sets other values to their initial state', () => {
    expect(
      reducer(
        {
          isUnpublishPending: true,
          didUnpublish: true,
          libraryDialogIsOpen: true,
        },
        shareDialog.showShareDialog()
      )
    ).toEqual({...originalState, ...{isOpen: true}});
  });

  it('hideShareDialog sets isOpen to false', () => {
    expect(reducer({isOpen: true}, shareDialog.hideShareDialog()).isOpen).toBe(
      false
    );
  });

  it('hideShareDialog sets unpublish values to false', () => {
    expect(
      reducer(
        {isOpen: true, isUnpublishPending: true, didUnpublish: true},
        shareDialog.hideShareDialog()
      )
    ).toEqual({
      isOpen: false,
      isUnpublishPending: false,
      didUnpublish: false,
    });
  });

  it('hideShareDialog leaves libraryDialogIsOpen unchanged', () => {
    expect(
      reducer(
        {isOpen: true, libraryDialogIsOpen: true},
        shareDialog.hideShareDialog()
      ).libraryDialogIsOpen
    ).toBe(true);
  });

  it('unpublish project sets isUnpublishPending to true', () => {
    expect(
      reducer(undefined, {type: UNPUBLISH_REQUEST}).isUnpublishPending
    ).toBe(true);
  });

  it('unpublish project only changes isUnpublishPending', () => {
    let state = {isOpen: true, libraryDialogIsOpen: true};
    expect(reducer(state, {type: UNPUBLISH_REQUEST})).toEqual({
      ...state,
      isUnpublishPending: true,
    });
  });

  it('unpublish success changes publish values to original state', () => {
    let result = reducer(
      {isOpen: true, isUnpublishPending: true, didUnpublish: false},
      {type: UNPUBLISH_SUCCESS}
    );
    expect(result.isOpen).toBe(false);
    expect(result.isUnpublishPending).toBe(false);
    expect(result.didUnpublish).toBe(true);
  });

  it('unpublish success leaves libraryDialogIsOpen unchanged', () => {
    expect(
      reducer({libraryDialogIsOpen: true}, {type: UNPUBLISH_SUCCESS})
        .libraryDialogIsOpen
    ).toBe(true);
  });

  it('unpublish fail changes only isUnpublishPending', () => {
    let state = {
      isOpen: true,
      isUnpublishPending: true,
      didUnpublish: true,
      libraryDialogIsOpen: true,
    };
    expect(reducer(state, {type: UNPUBLISH_FAILURE})).toEqual({
      ...state,
      ...{isUnpublishPending: false},
    });
  });

  it('saveReplayLog sets the changes only the replay log', () => {
    let state = {
      isOpen: true,
      isUnpublishPending: true,
      didUnpublish: true,
      libraryDialogIsOpen: true,
    };
    let testLog = 'test';
    expect(reducer(state, shareDialog.saveReplayLog(testLog))).toEqual({
      ...state,
      ...{replayLog: testLog},
    });
  });
});

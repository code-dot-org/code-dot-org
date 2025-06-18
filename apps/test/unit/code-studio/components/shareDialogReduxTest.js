/** @file Tests for share dialog redux module */
import reducer, * as shareDialog from '@cdo/apps/code-studio/components/shareDialogRedux';

describe('Share dialog redux module', () => {
  let originalState = {
    isOpen: false,
    libraryDialogIsOpen: false,
  };

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

  it('hideShareDialog leaves libraryDialogIsOpen unchanged', () => {
    expect(
      reducer(
        {isOpen: true, libraryDialogIsOpen: true},
        shareDialog.hideShareDialog()
      ).libraryDialogIsOpen
    ).toBe(true);
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

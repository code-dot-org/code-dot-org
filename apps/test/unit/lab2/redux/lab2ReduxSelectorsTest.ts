import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import {
  isReadOnlyForSaving,
  isReadOnlyWorkspace,
} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {RootState} from '@cdo/apps/types/redux';

// An owned, editable Python Lab project, which is the only app that turns the
// workspace read-only while it runs.
function buildState(
  overrides: {
    isRunning?: boolean;
    isOwner?: boolean;
    viewingOldVersion?: boolean;
  } = {}
) {
  const {
    isRunning = false,
    isOwner = true,
    viewingOldVersion = false,
  } = overrides;
  return {
    lab: {
      levelProperties: {appName: 'pythonlab'},
      channel: {isOwner, frozen: false},
    },
    lab2Project: {viewingOldVersion, viewingAiTutorVersion: false},
    lab2System: {isRunning, isValidating: false},
    predictLevel: {hasSubmittedResponse: false},
    progress: {},
  } as unknown as RootState;
}

describe('lab2 read-only selectors', () => {
  it('a running Python Lab workspace is read-only but still worth saving', () => {
    const state = buildState({isRunning: true});
    expect(isReadOnlyWorkspace(state)).to.be.true;
    expect(isReadOnlyForSaving(state)).to.be.false;
  });

  it('a project the user does not own is not saved', () => {
    expect(isReadOnlyForSaving(buildState({isOwner: false}))).to.be.true;
  });

  it('an old version being previewed is not saved', () => {
    expect(isReadOnlyForSaving(buildState({viewingOldVersion: true}))).to.be
      .true;
  });

  it('an editable project is saved', () => {
    expect(isReadOnlyForSaving(buildState())).to.be.false;
  });
});

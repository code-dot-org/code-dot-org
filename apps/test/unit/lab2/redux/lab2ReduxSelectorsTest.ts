import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import {
  isReadOnlyAndShouldNotBeSaved,
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
    expect(isReadOnlyAndShouldNotBeSaved(state)).to.be.false;
  });

  it('a project the user does not own is not saved', () => {
    expect(isReadOnlyAndShouldNotBeSaved(buildState({isOwner: false}))).to.be
      .true;
  });

  it('an old version being previewed is not saved', () => {
    expect(isReadOnlyAndShouldNotBeSaved(buildState({viewingOldVersion: true})))
      .to.be.true;
  });

  it('an editable project is saved', () => {
    expect(isReadOnlyAndShouldNotBeSaved(buildState())).to.be.false;
  });

  // Running must not mask a read-only reason that stands on its own.
  it('an old version being previewed is not saved while it runs', () => {
    const state = buildState({viewingOldVersion: true, isRunning: true});
    expect(isReadOnlyAndShouldNotBeSaved(state)).to.be.true;
  });

  it('a project the user does not own is not saved while it runs', () => {
    const state = buildState({isOwner: false, isRunning: true});
    expect(isReadOnlyAndShouldNotBeSaved(state)).to.be.true;
  });
});

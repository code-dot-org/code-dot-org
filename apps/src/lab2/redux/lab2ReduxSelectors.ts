import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {RootState} from '@cdo/apps/types/redux';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

// Redux selectors for lab2 state.

// If any load is currently in progress.
export const isLabLoading = (state: {lab: LabState}) =>
  state.lab.isLoadingProjectOrLevel ||
  state.lab.isLoading ||
  state.lab.isLoadingTheme;

// If there is an error present on the page.
export const hasPageError = (state: {lab: LabState}) => {
  return state.lab.pageError !== undefined;
};

// If the share and remix buttons should be hidden for the lab. Defaults to true (hidden)
// if not specified.
export const shouldHideShareAndRemix = (state: {lab: LabState}): boolean => {
  const hideShareAndRemix = state.lab.levelProperties?.hideShareAndRemix;
  return hideShareAndRemix === undefined ? true : hideShareAndRemix;
};

export const isProjectTemplateLevel = (state: {lab: LabState}) =>
  !!state.lab.levelProperties?.projectTemplateLevelName;

// Returns true if the workspace is permanently read-only.
// This excludes temporary read-only states such as running/validating.
export const isPermanentlyReadOnlyWorkspace = (state: RootState) => {
  const isEditMode = !!getAppOptionsEditBlocks();
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();
  const isWidgetView = !!state.lab.levelProperties?.widgetView;

  // Exemplar and block edit modes do not have a channel.
  if (isEditMode || isEditingExemplar) {
    return false;
  } else if (isViewingExemplar) {
    return true;
  }
  // Otherwise, we are in permanently read-only mode if we are not the owner of the channel,
  // the level is frozen, the level is a read-only predict level or in widget view.
  const isOwner = state.lab.channel?.isOwner;
  const isFrozen = !!state.lab.channel?.frozen;

  return !isOwner || isFrozen || isWidgetView;
};

// This may depend on more factors, such as share.
export const isReadOnlyWorkspace = (state: RootState) => {
  // Start with the permanently read-only check.
  const isPermanentlyReadOnly = isPermanentlyReadOnlyWorkspace(state);

  const hasSubmitted = getCurrentLevel(state)?.status === LevelStatus.submitted;
  const isViewingOldVersion = state.lab2Project.viewingOldVersion;
  const readOnlyPredictLevel = isReadOnlyPredictLevel(state);

  // Also check for temporary read-only state (running/validating).
  const isRunningAndReadonly =
    (state.lab2System.isRunning || state.lab2System.isValidating) &&
    shouldBeReadonlyWhileRunning(state);

  return (
    isPermanentlyReadOnly ||
    isRunningAndReadonly ||
    hasSubmitted ||
    isViewingOldVersion ||
    readOnlyPredictLevel
  );
};

// Helper functions

// Returns if the current state represents a predict level that should be read only.
// If the predict level code is not editable after submit or the user has not submitted a response,
// the predict level is read only.
function isReadOnlyPredictLevel(state: RootState) {
  const isPredictLevel =
    state.lab.levelProperties?.predictSettings?.isPredictLevel || false;
  let isReadOnlyPredictLevel = isPredictLevel;
  if (isPredictLevel) {
    const isEditableAfterSubmit =
      state.lab.levelProperties?.predictSettings?.codeEditableAfterSubmit ||
      false;
    const hasSubmittedPredictResponse = state.predictLevel.hasSubmittedResponse;
    // If the predict level code is not editable after submit or the user has not submitted a response,
    // the predict level is read only.
    isReadOnlyPredictLevel =
      !isEditableAfterSubmit || !hasSubmittedPredictResponse;
  }
  return isReadOnlyPredictLevel;
}

// Currently only Python Lab disables editing while code is running.
function shouldBeReadonlyWhileRunning(state: RootState) {
  return state.lab.levelProperties?.appName === 'pythonlab';
}

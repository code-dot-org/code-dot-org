import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {saveTypeToAnalyticsEvent} from '../../constants';
import {ViewMode} from '../../types';
import {endSave, setSavedAiCustomizations, setViewMode} from '../slice';
import {findChangedProperties} from '../utils';

import {sendAnalytics} from './sendAnalytics';

// Thunk called after a save has completed successfully.
// Updates the chat window and reports analytics as necessary.
export const onSaveComplete =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const {savedAiCustomizations, currentAiCustomizations, currentSaveType} =
      getState().aichat;

    const changedProperties = findChangedProperties(
      savedAiCustomizations,
      currentAiCustomizations
    );

    changedProperties.forEach(property => {
      // Report to analytics the changed value for only selected model id and temperature properties.
      // Do not include the free text changes (system prompt and retrieval contexts).
      const propertiesChangedValueToReport = ['selectedModelId', 'temperature'];
      const propertyChangedTo = propertiesChangedValueToReport.includes(
        property
      )
        ? currentAiCustomizations[property]
        : 'NULL';
      if (currentSaveType) {
        dispatch(
          sendAnalytics(saveTypeToAnalyticsEvent[currentSaveType], {
            propertyUpdated: property,
            propertyChangedTo,
            levelPath: window.location.pathname,
          })
        );
      }
    });

    // Update our last saved customizations to match the current customizations
    dispatch(setSavedAiCustomizations(currentAiCustomizations));
    // Notify the UI that the save is complete.
    dispatch(endSave());
    // Send a report that user has started the aichat level after a successful save.
    // A teacher will view that the level is now in progress.
    dispatch(sendProgressReport('aichat', TestResults.LEVEL_STARTED));
    // Go to the presentation page if we just finished publishing the model card.
    if (currentSaveType === 'publishModelCard') {
      dispatch(setViewMode(ViewMode.PRESENTATION));
    }
  };

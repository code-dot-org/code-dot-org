import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {saveTypeToAnalyticsEvent} from '../../constants';
import {AiCustomizations, ViewMode} from '../../types';
import {
  endSave,
  setNewChatSession,
  setSavedAiCustomizations,
  setViewMode,
} from '../slice';
import {findChangedProperties, getNewMessageId} from '../utils';

import {addChatEvent} from './addChatEvent';
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
    if (
      changedProperties.some(property =>
        [
          'selectedModelId',
          'temperature',
          'systemPrompt',
          'retrievalContexts',
        ].includes(property)
      )
    ) {
      dispatch(setNewChatSession());
    }

    changedProperties.forEach(property => {
      const typedProperty = property as keyof AiCustomizations;
      const modelUpdate = {
        id: getNewMessageId(),
        updatedField: typedProperty,
        updatedValue: currentAiCustomizations[typedProperty],
        timestamp: Date.now(),
      };
      dispatch(addChatEvent(modelUpdate));

      // Report to analytics the changed value for only selected model id and temperature properties.
      // Do not include the free text changes (system prompt and retrieval contexts).
      const propertiesChangedValueToReport = ['selectedModelId', 'temperature'];
      const propertyChangedTo = propertiesChangedValueToReport.includes(
        typedProperty
      )
        ? currentAiCustomizations[typedProperty]
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

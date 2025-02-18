// This thunk saves a student's AI customizations using the Project Manager (ie, to S3 typically),
// then does a comparison between the previous and current saved customizations in order to

import {createAsyncThunk} from '@reduxjs/toolkit';

import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {saveAiCustomization} from './helpers/saveAiCustomization';

// output a message to the chat window with the list of customizations that were updated.
export const updateAiCustomization = createAsyncThunk(
  'aichat/updateAiCustomization',
  async (_, {dispatch, getState}) => {
    await saveAiCustomization(
      (getState() as RootState).aichat.currentAiCustomizations,
      'updateChatbot',
      dispatch as AppDispatch
    );
  }
);

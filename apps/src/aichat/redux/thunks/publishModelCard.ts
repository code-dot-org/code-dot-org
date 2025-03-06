import {createAsyncThunk} from '@reduxjs/toolkit';

import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {setModelCardProperty} from '../slice';

import {saveAiCustomization} from './helpers/saveAiCustomization';

// This thunk is used when a student fills out a model card and "publishes" their model,
// enabling access to a "presentation view" where they can interact with their model
// and view its details (temperature, system prompt, etc) in a summary view.
export const publishModelCard = createAsyncThunk(
  'aichat/publishModelCard',
  async (_, {dispatch, getState}) => {
    dispatch(setModelCardProperty({property: 'isPublished', value: true}));

    // Note that it's important that we get the state after we dispatch the Redux action to publish the model card.
    // Otherwise, there's no state change detected and the updated published state won't be saved.
    const state = getState() as RootState;
    await saveAiCustomization(
      state.aichat.currentAiCustomizations,
      'publishModelCard',
      dispatch as AppDispatch,
      parseInt(state.progress.currentLevelId || '')
    );
  }
);

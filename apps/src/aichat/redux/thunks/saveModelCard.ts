import {createAsyncThunk} from '@reduxjs/toolkit';

import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {setModelCardProperty} from '../slice';
import {hasFilledOutModelCard} from '../utils';

import {saveAiCustomization} from './helpers/saveAiCustomization';

// This thunk enables a student to save a partially completed model card
// in the "Publish" tab.
export const saveModelCard = createAsyncThunk(
  'aichat/saveModelCard',
  async (_, {dispatch, getState}) => {
    const {modelCardInfo} = (getState() as RootState).aichat
      .currentAiCustomizations;
    if (!hasFilledOutModelCard(modelCardInfo)) {
      dispatch(setModelCardProperty({property: 'isPublished', value: false}));
    }

    const postUpdateState = getState() as RootState;
    await saveAiCustomization(
      postUpdateState.aichat.currentAiCustomizations,
      'saveModelCard',
      dispatch as AppDispatch,
      parseInt(postUpdateState.progress.currentLevelId || '')
    );
  }
);

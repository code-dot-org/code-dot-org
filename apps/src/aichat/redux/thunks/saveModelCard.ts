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
    const {currentAiCustomizations} = (getState() as RootState).aichat;
    const modelCardInfo = currentAiCustomizations.modelCardInfo;
    if (!hasFilledOutModelCard(modelCardInfo)) {
      dispatch(setModelCardProperty({property: 'isPublished', value: false}));
    }

    await saveAiCustomization(
      currentAiCustomizations,
      'saveModelCard',
      dispatch as AppDispatch
    );
  }
);

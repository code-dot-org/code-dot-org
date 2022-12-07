import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppOptions, defaultAppOptions } from '../../AppOptions';

type CommonState = {
  appOptions: AppOptions
}

// TODO: should be deep copy
const initialState: CommonState = {
  appOptions: {...defaultAppOptions}
}

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setAppOptions: (state, action: PayloadAction<AppOptions>) => {
      state.appOptions = action.payload
    }
  }
})

export const {setAppOptions} = commonSlice.actions
export default commonSlice.reducer
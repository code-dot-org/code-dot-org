import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface MapboxState {
  mapboxAccessToken: null | string;
}

const initialState: MapboxState = {
  mapboxAccessToken: null,
};

const mapboxSlice = createSlice({
  name: 'mapbox',
  initialState,
  reducers: {
    setMapboxAccessToken(state, action: PayloadAction<string>) {
      state.mapboxAccessToken = action.payload;
    },
  },
});

export const {setMapboxAccessToken} = mapboxSlice.actions;

export default mapboxSlice.reducer;

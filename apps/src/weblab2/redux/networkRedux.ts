import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

export interface NetworkRequest {
  method: string;
  requestTime: string;
  url: string;
  statusCode: number;
  timeElapsed: number;
  responseData: string;
}

export interface Weblab2NetworkState {
  requests: NetworkRequest[];
}

const initialState: Weblab2NetworkState = {
  requests: [],
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    addRequest: (state, action: PayloadAction<NetworkRequest>) => {
      state.requests.push(action.payload);
    },
    clearRequests: state => {
      state.requests = [];
    },
  },
});

registerReducers({weblab2Network: networkSlice.reducer});

export const {addRequest, clearRequests} = networkSlice.actions;

export default networkSlice.reducer;

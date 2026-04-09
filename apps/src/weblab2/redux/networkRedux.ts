import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

export interface NetworkEntry {
  id: string;
  request: RequestData;
  response?: ResponseData;
}

interface RequestData {
  method: string;
  startTime: string;
  url: string;
  cspDirectiveViolated?: string;
  blocked?: boolean;
}

interface ResponseData {
  url: string;
  status: number;
  timeElapsed?: number;
  body?: string;
  error?: Error;
  contentType?: string;
}

export interface Weblab2NetworkState {
  requests: NetworkEntry[];
  blockNetwork: boolean;
}

const initialState: Weblab2NetworkState = {
  requests: [],
  blockNetwork: false,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    addRequestData: (
      state,
      action: PayloadAction<{id: string; request: RequestData}>
    ) => {
      state.requests.push(action.payload);
    },
    addResponseData: (
      state,
      action: PayloadAction<{id: string; response: ResponseData}>
    ) => {
      const {id, response} = action.payload;
      const request = state.requests.find(r => r.id === id);
      if (request) {
        request.response = response;
      }
    },
    clearRequests: state => {
      state.requests = [];
    },
    setBlockNetwork: (state, action: PayloadAction<boolean>) => {
      state.blockNetwork = action.payload;
    },
  },
});

registerReducers({weblab2Network: networkSlice.reducer});

export const {addRequestData, addResponseData, clearRequests, setBlockNetwork} =
  networkSlice.actions;

export default networkSlice.reducer;

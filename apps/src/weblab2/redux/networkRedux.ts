import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

export interface FullRequest {
  id: string;
  request: RequestData;
  response?: ResponseData;
}

interface RequestData {
  method: string;
  startTime: string;
  url: string;
}

interface ResponseData {
  statusCode: number;
  timeElapsed?: number;
  responseData?: string;
  error?: Error;
}

export interface Weblab2NetworkState {
  requests: FullRequest[];
}

const initialState: Weblab2NetworkState = {
  requests: [],
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    addRequestData: (
      state,
      action: PayloadAction<{id: string; request: RequestData}>
    ) => {
      console.log({addingRequest: action.payload});
      state.requests.push(action.payload);
    },
    addResponseData: (
      state,
      action: PayloadAction<{id: string; response: ResponseData}>
    ) => {
      console.log({addingResponse: action.payload});
      const {id, response} = action.payload;
      const request = state.requests.find(r => r.id === id);
      if (request) {
        request.response = response;
      }
    },
    clearRequests: state => {
      state.requests = [];
    },
  },
});

registerReducers({weblab2Network: networkSlice.reducer});

export const {addRequestData, addResponseData, clearRequests} =
  networkSlice.actions;

export default networkSlice.reducer;

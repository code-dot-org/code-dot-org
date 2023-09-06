import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {registerReducers} from '@cdo/apps/redux';

type SongData = {
  [key: string]: {
    title: string;
    url: string;
    pg13: boolean;
  };
};

export interface DanceState {
  selectedSong: string;
  songData: SongData;
  runIsStarting: boolean;
}

const initialState: DanceState = {
  selectedSong: 'macklemore90',
  songData: {},
  runIsStarting: false,
};

const danceSlice = createSlice({
  name: 'dance',
  initialState,
  reducers: {
    setSongData: (state, action: PayloadAction<SongData>) => {
      state.songData = action.payload;
    },
    setSelectedSong: (state, action: PayloadAction<string>) => {
      state.selectedSong = action.payload;
    },
    setRunIsStarting: (state, action: PayloadAction<boolean>) => {
      state.runIsStarting = action.payload;
    },
  },
});

export const {setSongData, setSelectedSong, setRunIsStarting} =
  danceSlice.actions;
export const reducers = {dance: danceSlice.reducer};

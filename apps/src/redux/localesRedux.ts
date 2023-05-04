import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface LocaleState {
  localeCode: null | string;
}

const initialState: LocaleState = {
  localeCode: null,
};

const localeSlice = createSlice({
  name: 'locales',
  initialState,
  reducers: {
    setLocaleCode(state, action: PayloadAction<string>) {
      state.localeCode = action.payload;
    },
  },
});

export const {setLocaleCode} = localeSlice.actions;

export default localeSlice.reducer;

import {PayloadAction, createSlice} from '@reduxjs/toolkit';

// The full set of tabs for the SpriteLab2 full-screen UI. Items/World arrive in
// later phases; Code/Play are wired first.
export const SPRITE_LAB2_TABS = ['Images', 'World', 'Code', 'Play'] as const;
export type SpriteLab2Tab = (typeof SPRITE_LAB2_TABS)[number];

// AI code-generation lifecycle, modeled on Music's GenerateCode state machine.
// Only used once the Code-tab AI pane lands (phase 5); declared here so the
// slice shape is stable.
export type AiGenerateState =
  | 'none'
  | 'generating'
  | 'generated'
  | 'listened'
  | 'editing'
  | 'edited';

export interface SpriteLab2State {
  activeTab: SpriteLab2Tab;
  hasRun: boolean;
  hasEdited: boolean;
  aiGenerateState: AiGenerateState;
}

const initialState: SpriteLab2State = {
  activeTab: 'Code',
  hasRun: false,
  hasEdited: false,
  aiGenerateState: 'none',
};

const spriteLab2Slice = createSlice({
  name: 'spriteLab2',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<SpriteLab2Tab>) => {
      state.activeTab = action.payload;
    },
    setHasRun: (state, action: PayloadAction<boolean>) => {
      state.hasRun = action.payload;
    },
    setHasEdited: (state, action: PayloadAction<boolean>) => {
      state.hasEdited = action.payload;
    },
    setAiGenerateState: (state, action: PayloadAction<AiGenerateState>) => {
      state.aiGenerateState = action.payload;
    },
    resetSpriteLab2: () => initialState,
  },
});

export const {
  setActiveTab,
  setHasRun,
  setHasEdited,
  setAiGenerateState,
  resetSpriteLab2,
} = spriteLab2Slice.actions;

export default spriteLab2Slice.reducer;

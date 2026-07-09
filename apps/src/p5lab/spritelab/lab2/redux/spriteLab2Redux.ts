import {PayloadAction, createSlice} from '@reduxjs/toolkit';

// The full set of tabs for the SpriteLab2 full-screen UI.
export const SPRITE_LAB2_TABS = ['Images', 'World', 'Code', 'Play'] as const;
export type SpriteLab2Tab = (typeof SPRITE_LAB2_TABS)[number];

// AI code-generation lifecycle, modeled on Music's GenerateCode state machine.
export type AiGenerateState =
  | 'none'
  | 'generating'
  | 'generated'
  | 'listened'
  | 'editing'
  | 'edited';

// Redux mirror of the scenes (full data lives in project sources), so the
// scene selector and the go-to-scene dropdown can read it reactively.
export interface SceneMetadata {
  id: string;
  name: string;
}

// A scene from a section-mate's project, offered by the go-to-external-scene
// block's dropdown. key = "<channel>:<sceneId>" (the value the block stores);
// label is what the dropdown shows.
export interface ExternalSceneOption {
  key: string;
  label: string;
}

export interface SpriteLab2State {
  activeTab: SpriteLab2Tab;
  hasRun: boolean;
  hasEdited: boolean;
  aiGenerateState: AiGenerateState;
  scenes: SceneMetadata[];
  // The scene whose workspace is open in the Code tab.
  activeSceneId: string | null;
  externalScenes: ExternalSceneOption[];
}

const initialState: SpriteLab2State = {
  activeTab: 'Code',
  hasRun: false,
  hasEdited: false,
  aiGenerateState: 'none',
  scenes: [],
  activeSceneId: null,
  externalScenes: [],
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
    setScenes: (state, action: PayloadAction<SceneMetadata[]>) => {
      state.scenes = action.payload;
    },
    setActiveSceneId: (state, action: PayloadAction<string | null>) => {
      state.activeSceneId = action.payload;
    },
    setExternalScenes: (
      state,
      action: PayloadAction<ExternalSceneOption[]>
    ) => {
      state.externalScenes = action.payload;
    },
    resetSpriteLab2: () => initialState,
  },
});

export const {
  setActiveTab,
  setHasRun,
  setHasEdited,
  setAiGenerateState,
  setScenes,
  setActiveSceneId,
  setExternalScenes,
  resetSpriteLab2,
} = spriteLab2Slice.actions;

export default spriteLab2Slice.reducer;

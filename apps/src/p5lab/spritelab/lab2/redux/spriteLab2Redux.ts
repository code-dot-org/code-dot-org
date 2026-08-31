import {PayloadAction, createSlice} from '@reduxjs/toolkit';

// The full set of tabs for the SpriteLab2 full-screen UI.
export const ALL_TABS = ['Images', 'World', 'Code', 'Play'] as const;
export type Tab = (typeof ALL_TABS)[number];

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

// One of the user's Music Lab projects, offered by the play-music block's
// dropdown; channel is the value the block stores.
export interface MusicProjectOption {
  channel: string;
  name: string;
  /** A saved block's song the list no longer offers; shown, not offered. */
  unavailable?: boolean;
}

export interface SpriteLab2State {
  activeTab: Tab;
  hasRun: boolean;
  aiGenerateState: AiGenerateState;
  scenes: SceneMetadata[];
  externalScenes: ExternalSceneOption[];
  musicProjects: MusicProjectOption[];
}

const initialState: SpriteLab2State = {
  activeTab: 'Code',
  hasRun: false,
  aiGenerateState: 'none',
  scenes: [],
  externalScenes: [],
  musicProjects: [],
};

const spriteLab2Slice = createSlice({
  name: 'spriteLab2',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<Tab>) => {
      state.activeTab = action.payload;
    },
    setHasRun: (state, action: PayloadAction<boolean>) => {
      state.hasRun = action.payload;
    },
    setAiGenerateState: (state, action: PayloadAction<AiGenerateState>) => {
      state.aiGenerateState = action.payload;
    },
    setScenes: (state, action: PayloadAction<SceneMetadata[]>) => {
      state.scenes = action.payload;
    },
    setExternalScenes: (
      state,
      action: PayloadAction<ExternalSceneOption[]>
    ) => {
      state.externalScenes = action.payload;
    },
    setMusicProjects: (state, action: PayloadAction<MusicProjectOption[]>) => {
      state.musicProjects = action.payload;
    },
    resetSpriteLab2: () => initialState,
  },
});

export const {
  setActiveTab,
  setHasRun,
  setAiGenerateState,
  setScenes,
  setExternalScenes,
  setMusicProjects,
  resetSpriteLab2,
} = spriteLab2Slice.actions;

export default spriteLab2Slice.reducer;

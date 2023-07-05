import {createSlice} from '@reduxjs/toolkit';

export const possibleHeaders = {
  project: 'project',
  minimalProject: 'minimalProject',
  projectBacked: 'projectBacked',
  levelBuilderSave: 'levelBuilderSave',
} as const;

interface HeaderReduxState {
  currentHeader: keyof typeof possibleHeaders | undefined;
  getLevelBuilderChanges: undefined; // todo: this shouldn't be here, it's a function
  overrideHeaderText: string | undefined;
  overrideOnSaveUrl: string | undefined;
}

const initialState: HeaderReduxState = {
  currentHeader: undefined,
  getLevelBuilderChanges: undefined,
  overrideHeaderText: undefined,
  overrideOnSaveUrl: undefined,
};

const headerSlice = createSlice({});

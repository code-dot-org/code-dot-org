// Redux slice for the AI Lessons-specific snapshot of saved project
// sources, keyed by lab type.  This is separate from
// `state.lab2Project.projectSources` on purpose: dispatching into the lab2
// project state on every save creates a feedback loop in Music Lab (its
// MusicView.componentDidUpdate watches the lab2Project source and reloads
// the Blockly workspace whenever it changes).  Our slice is read by
// useStudentWork for sending snapshots to the AI Tutor, and is invisible
// to the lab views themselves.

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {ProjectSources} from '@cdo/apps/lab2/types';
import {registerReducers} from '@cdo/apps/redux';

export interface AiLessonsSourcesState {
  byLabType: Record<string, ProjectSources | undefined>;
}

const initialState: AiLessonsSourcesState = {
  byLabType: {},
};

const slice = createSlice({
  name: 'aiLessonsSources',
  initialState,
  reducers: {
    setSavedSource(
      state,
      action: PayloadAction<{labType: string; sources: ProjectSources}>
    ) {
      state.byLabType[action.payload.labType] = action.payload.sources;
    },
  },
});

export const {setSavedSource} = slice.actions;

registerReducers({aiLessonsSources: slice.reducer});

// Lets components read from a strongly-typed root without us having to
// teach the global RootState about this slice.
export const selectSavedSource = (
  state: unknown,
  labType: string
): ProjectSources | undefined => {
  const s = state as {aiLessonsSources?: AiLessonsSourcesState};
  return s.aiLessonsSources?.byLabType[labType];
};

export default slice.reducer;

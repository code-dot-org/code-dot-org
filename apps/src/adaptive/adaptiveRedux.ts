// Player state for the current Adaptive level: position, answers, and
// completion. Saved to the server on step completion; results post through
// the shared Lab2 milestone path.

import {
  AnyAction,
  createSlice,
  PayloadAction,
  ThunkAction,
} from '@reduxjs/toolkit';

import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {RootState} from '@cdo/apps/types/redux';

import {loadAdaptiveState, saveAdaptiveState} from './progressApi';
import {
  AdaptiveContent,
  AdaptiveProgress,
  AnswerRecord,
  nextStepId,
  stepById,
} from './types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AdaptiveState extends AdaptiveProgress {
  // 'ready' also covers a level viewed outside a unit, where nothing is
  // loaded or saved.
  status: 'idle' | 'loading' | 'ready';
  // The level the state belongs to, so a slow load for a previous level
  // cannot land after the student switched levels.
  scriptId: number | null;
  levelId: number | null;
}

const initialState: AdaptiveState = {
  status: 'idle',
  scriptId: null,
  levelId: null,
  currentStepId: null,
  path: [],
  completedStepIds: [],
  answers: {},
  completed: false,
};

function freshProgress(content: AdaptiveContent): AdaptiveProgress {
  const first = content.steps[0]?.id ?? null;
  return {
    currentStepId: first,
    path: first ? [first] : [],
    completedStepIds: [],
    answers: {},
    completed: false,
  };
}

// Saved state survives content edits only while its current step still
// exists; otherwise the student starts over.
function resumableProgress(
  content: AdaptiveContent,
  saved: AdaptiveProgress | null
): AdaptiveProgress {
  if (!saved) return freshProgress(content);
  if (saved.completed || stepById(content, saved.currentStepId)) {
    return {...freshProgress(content), ...saved};
  }
  return freshProgress(content);
}

const adaptiveSlice = createSlice({
  name: 'adaptive',
  initialState,
  reducers: {
    progressLoading(
      state,
      action: PayloadAction<{scriptId: number | null; levelId: number}>
    ) {
      return {...initialState, status: 'loading', ...action.payload};
    },
    progressReady(
      state,
      action: PayloadAction<{
        scriptId: number | null;
        levelId: number;
        content: AdaptiveContent;
        saved: AdaptiveProgress | null;
      }>
    ) {
      const {scriptId, levelId, content, saved} = action.payload;
      if (state.scriptId !== scriptId || state.levelId !== levelId) return;
      return {
        ...state,
        status: 'ready',
        ...resumableProgress(content, saved),
      };
    },
    answerRecorded(state, action: PayloadAction<AnswerRecord>) {
      state.answers[action.payload.questionId] = action.payload;
    },
    stepCompleted(
      state,
      action: PayloadAction<{stepId: string; nextStepId: string | null}>
    ) {
      const {stepId, nextStepId: next} = action.payload;
      if (!state.completedStepIds.includes(stepId)) {
        state.completedStepIds.push(stepId);
      }
      if (next === null) {
        state.completed = true;
        return;
      }
      state.currentStepId = next;
      state.path.push(next);
    },
  },
});

registerReducers({adaptive: adaptiveSlice.reducer});

export default adaptiveSlice.reducer;

export const {progressLoading, progressReady, answerRecorded, stepCompleted} =
  adaptiveSlice.actions;

export function selectProgress(state: AdaptiveState): AdaptiveProgress {
  const {currentStepId, path, completedStepIds, answers, completed} = state;
  return {currentStepId, path, completedStepIds, answers, completed};
}

type AdaptiveThunk = ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  AnyAction
>;

export function loadProgress(
  content: AdaptiveContent,
  scriptId: number | null,
  levelId: number
): AdaptiveThunk {
  return async dispatch => {
    dispatch(progressLoading({scriptId, levelId}));
    let saved: AdaptiveProgress | null = null;
    if (scriptId !== null) {
      try {
        saved = await loadAdaptiveState(scriptId, levelId);
      } catch (e) {
        console.warn('Adaptive: could not load saved state', e);
      }
    }
    dispatch(progressReady({scriptId, levelId, content, saved}));
  };
}

async function persist(state: AdaptiveState): Promise<void> {
  if (state.scriptId === null || state.levelId === null) return;
  try {
    await saveAdaptiveState(
      state.scriptId,
      state.levelId,
      selectProgress(state)
    );
  } catch (e) {
    console.warn('Adaptive: could not save state', e);
  }
}

// Completes the current step, saves, and reports progress. Finishing the
// last step hands off to the standard Lab2 continue flow, which posts
// ALL_PASS and moves to the next level.
export function completeCurrentStep(
  content: AdaptiveContent,
  appName: string
): AdaptiveThunk {
  return async (dispatch, getState) => {
    const {currentStepId, completed} = getState().adaptive;
    if (!currentStepId || completed) return;
    const next = nextStepId(content, currentStepId);
    dispatch(stepCompleted({stepId: currentStepId, nextStepId: next}));
    await persist(getState().adaptive);
    if (next === null) {
      dispatch(continueOrFinishLesson());
    } else {
      dispatch(sendProgressReport(appName, TestResults.LEVEL_INCOMPLETE_FAIL));
    }
  };
}

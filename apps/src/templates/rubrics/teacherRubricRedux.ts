import {
  PayloadAction,
  createSelector,
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {setLoadedLevelsWithProgressForTest} from '@cdo/apps/code-studio/teacherPanelRedux';
import {LevelWithProgress} from '@cdo/apps/code-studio/teacherPanelTypes';
import {computeBubbleStatus} from '@cdo/apps/templates/rubrics/rubricUtils';
import {RootState} from '@cdo/apps/types/redux';
interface TeacherEvaluation {
  feedback: string;
  id: number;
  learning_goal_id: number;
  understanding: number;
}

interface UserEvalData {
  eval: TeacherEvaluation[];
  user_family_name?: string;
  user_id: number;
  user_name: string;
}

type AllTeacherEvaluationData = UserEvalData[];

interface HasTeacherFeedbackMap {
  [key: number]: boolean;
}

// map from counter name to count
interface AiEvalStatusCounters {
  [key: string]: number;
}

// map from user id to ai eval status
interface AiEvalStatusMap {
  [key: number]: string;
}

export interface TeacherRubricState {
  allTeacherEvaluationData: AllTeacherEvaluationData;
  hasTeacherFeedbackMap: HasTeacherFeedbackMap;
  aiEvalStatusCounters: AiEvalStatusCounters;
  aiEvalStatusMap: AiEvalStatusMap;
  hasLoadedTeacherFeedback: boolean;
  hasLoadedAiEvalStatus: boolean;
}

// map from user id to student progress status
interface StudentProgressStatusMap {
  [key: number]: string;
}

const initialState: TeacherRubricState = {
  allTeacherEvaluationData: [],
  hasTeacherFeedbackMap: {},
  aiEvalStatusCounters: {},
  aiEvalStatusMap: {},
  hasLoadedTeacherFeedback: false,
  hasLoadedAiEvalStatus: false,
};

const teacherRubricReduxSlice = createSlice({
  name: 'teacherRubric',
  initialState,
  reducers: {
    setAllTeacherEvaluationData(
      state,
      action: PayloadAction<AllTeacherEvaluationData>
    ) {
      state.allTeacherEvaluationData = action.payload;
    },
    setHasTeacherFeedbackMap(
      state,
      action: PayloadAction<HasTeacherFeedbackMap>
    ) {
      state.hasTeacherFeedbackMap = action.payload;
    },
    setUserHasTeacherFeedback(state, action: PayloadAction<number>) {
      state.hasTeacherFeedbackMap[action.payload] = true;
    },
    setAiEvalStatusCounters(
      state,
      action: PayloadAction<AiEvalStatusCounters>
    ) {
      state.aiEvalStatusCounters = action.payload;
    },
    setAiEvalStatusMap(state, action: PayloadAction<AiEvalStatusMap>) {
      state.aiEvalStatusMap = action.payload;
    },
    setUserAiEvalStatus: {
      reducer(state, action: PayloadAction<{userId: number; status: string}>) {
        state.aiEvalStatusMap[action.payload.userId] = action.payload.status;
      },
      prepare(userId: number, status: string) {
        return {payload: {userId, status}};
      },
    },
    setLoadedHasTeacherFeedback: state => {
      state.hasLoadedTeacherFeedback = true;
    },
    setLoadedAiEvalStatus: state => {
      state.hasLoadedAiEvalStatus = true;
    },
  },
});

export const loadAllTeacherEvaluationData = createAsyncThunk(
  'teacherRubric/loadAllTeacherEvaluationData',
  async (params: {rubricId: number; sectionId: number}, thunkAPI) => {
    const {rubricId, sectionId} = params;

    const fetchTeacherEvaluationAll = (rubricId: number, sectionId: number) => {
      return fetch(
        `/rubrics/${rubricId}/get_teacher_evaluations_for_all?section_id=${sectionId}`
      );
    };

    const initializeHasTeacherFeedbackMap = (
      allTeacherEvaluationData: AllTeacherEvaluationData
    ) => {
      const hasFeedbackMap: HasTeacherFeedbackMap = {};
      allTeacherEvaluationData.forEach(userEvalData => {
        hasFeedbackMap[userEvalData.user_id] = userEvalData.eval.length > 0;
      });
      thunkAPI.dispatch(setHasTeacherFeedbackMap(hasFeedbackMap));
    };

    fetchTeacherEvaluationAll(rubricId, sectionId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          initializeHasTeacherFeedbackMap(data);
          thunkAPI.dispatch(setAllTeacherEvaluationData(data));
          thunkAPI.dispatch(setLoadedHasTeacherFeedback());
        });
      }
    });
  }
);

export const loadAiEvalStatusForAll = createAsyncThunk(
  'teacherRubric/loadAiEvalStatusForAll',
  async (params: {rubricId: number; sectionId: number}, thunkAPI) => {
    const {rubricId, sectionId} = params;

    const fetchAiEvaluationStatusAll = (
      rubricId: number,
      sectionId: number
    ) => {
      return fetch(
        `/rubrics/${rubricId}/ai_evaluation_status_for_all?section_id=${sectionId}`
      );
    };

    fetchAiEvaluationStatusAll(rubricId, sectionId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          thunkAPI.dispatch(setAiEvalStatusMap(data.aiEvalStatusMap));
          delete data.aiEvalStatusMap;
          thunkAPI.dispatch(setAiEvalStatusCounters(data));
          thunkAPI.dispatch(setLoadedAiEvalStatus());
        });
      }
    });
  }
);

export const setLoadedStudentStatusForTest = createAsyncThunk(
  'teacherRubric/setLoadedStudentStatusForTest',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(setLoadedHasTeacherFeedback());
    thunkAPI.dispatch(setLoadedAiEvalStatus());
    thunkAPI.dispatch(setLoadedLevelsWithProgressForTest());
  }
);

export const selectStudentProgressStatusMap = createSelector(
  [
    (state: RootState) => state.teacherRubric.hasTeacherFeedbackMap || {},
    (state: RootState) => state.teacherRubric.aiEvalStatusMap || {},
    (state: RootState) => state.teacherPanel.levelsWithProgress || [],
  ],
  (hasTeacherFeedbackMap, aiEvalStatusMap, levelsWithProgress) => {
    const statusMap: StudentProgressStatusMap = {};
    levelsWithProgress.forEach((level: LevelWithProgress) => {
      const userId = level.userId;
      const aiEvalStatus = aiEvalStatusMap[userId];
      const hasFeedback = hasTeacherFeedbackMap[userId];
      statusMap[userId] = computeBubbleStatus(level, aiEvalStatus, hasFeedback);
    });
    return statusMap;
  }
);

export const selectReadyStudentCount = createSelector(
  selectStudentProgressStatusMap,
  statusMap =>
    Object.values(statusMap).filter(status => status === 'READY_TO_REVIEW')
      .length
);

export const selectHasLoadedStudentStatus = createSelector(
  [
    (state: RootState) => state.teacherRubric.hasLoadedTeacherFeedback,
    (state: RootState) => state.teacherRubric.hasLoadedAiEvalStatus,
    (state: RootState) => state.teacherPanel.hasLoadedLevelsWithProgress,
  ],
  (
    hasLoadedTeacherFeedback: boolean,
    hasLoadedAiEvalStatus: boolean,
    hasLoadedLevelsWithProgress: boolean
  ) => {
    return (
      hasLoadedTeacherFeedback &&
      hasLoadedAiEvalStatus &&
      hasLoadedLevelsWithProgress
    );
  }
);

// For internal use only
const {
  setHasTeacherFeedbackMap,
  setLoadedHasTeacherFeedback,
  setLoadedAiEvalStatus,
} = teacherRubricReduxSlice.actions;

// Exported for testing only
export const {setAllTeacherEvaluationData, setAiEvalStatusCounters} =
  teacherRubricReduxSlice.actions;

// Standard exports
export const {
  setUserHasTeacherFeedback,
  setAiEvalStatusMap,
  setUserAiEvalStatus,
} = teacherRubricReduxSlice.actions;
export default teacherRubricReduxSlice.reducer;

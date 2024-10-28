import {PayloadAction, createSlice, createAsyncThunk} from '@reduxjs/toolkit';

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

interface TeacherRubricState {
  allTeacherEvaluationData: AllTeacherEvaluationData;
  hasTeacherFeedbackMap: HasTeacherFeedbackMap;
}

const initialState: TeacherRubricState = {
  allTeacherEvaluationData: [],
  hasTeacherFeedbackMap: {},
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
        });
      }
    });
  }
);

// For internal use only
const {setHasTeacherFeedbackMap} = teacherRubricReduxSlice.actions;

// Exported for testing only
export const {setAllTeacherEvaluationData} = teacherRubricReduxSlice.actions;

// Standard exports
export const {setUserHasTeacherFeedback} = teacherRubricReduxSlice.actions;
export default teacherRubricReduxSlice.reducer;

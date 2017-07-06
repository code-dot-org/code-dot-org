const SET_CLASSROOM_LIST = 'teacherDashboard/SET_CLASSROOM_LIST';
const FAILED_LOAD = 'teacherDashboard/FAILED_LOAD';

export const loadClassroomList = () => {
  return dispatch => {
    $.ajax('/dashboardapi/google_classrooms')
      .success(response => dispatch(setClassroomList(response.courses)))
      .fail(() => dispatch(failedLoad()));
  };
};

export const setClassroomList = classrooms => ({ type: SET_CLASSROOM_LIST, classrooms });

export const failedLoad = () => ({ type: FAILED_LOAD });

const initialState = {
  classrooms: null,
};

export default function googleClassroom(state = initialState, action) {
  if (action.type === SET_CLASSROOM_LIST) {
    return {
      ...state,
      classrooms: action.classrooms.slice(),
    };
  }

  if (action.type === FAILED_LOAD) {
    return {
      ...state,
      classrooms: false,
    };
  }

  return state;
}

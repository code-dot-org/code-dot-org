const SET_CLASSROOM_LIST = 'teacherDashboard/SET_CLASSROOM_LIST';
const FAILED_LOAD = 'teacherDashboard/FAILED_LOAD';

export const loadClassroomList = () => {
  return dispatch => {
    $.ajax('/dashboardapi/google_classrooms')
      .success(response => dispatch(setClassroomList(response.courses)))
      .fail(result => {
        const message = result.responseJSON ? result.responseJSON.error : 'Unknown error.';
        dispatch(failedLoad(result.status, message));
      });
  };
};

export const setClassroomList = classrooms => ({ type: SET_CLASSROOM_LIST, classrooms });

export const failedLoad = (status, message) => ({ type: FAILED_LOAD, status, message });

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
      loadError: {
        status: action.status,
        message: action.message,
      }
    };
  }

  return state;
}

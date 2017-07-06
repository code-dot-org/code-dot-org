const SET_CLASSROOM_LIST = 'teacherDashboard/SET_CLASSROOM_LIST';

export const loadClassroomList = () => {
  return dispatch => {
    $.ajax('/dashboardapi/google_classrooms').success(response => dispatch(setClassroomList(response.courses)));
  };
};
export const setClassroomList = classrooms => ({ type: SET_CLASSROOM_LIST, classrooms });

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

  return state;
}

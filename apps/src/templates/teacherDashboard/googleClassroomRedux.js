/* global gapi */

const DISCOVERY = ['https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest'];
const CLIENT_ID = '254945981659-modh6ba8erd7iue9jr054o71dfa204o2.apps.googleusercontent.com';
const SCOPE = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly'
].join(' ');

const SET_CLASSROOM_LIST = 'teacherDashboard/SET_CLASSROOM_LIST';

function getClassroomList(dispatch) {
  gapi.client.classroom.courses.list({teacherId: 'me'}).then(response =>
    dispatch(setClassroomList(response.result.courses))
  );
}

export const loadClassroomList = () => {
  return dispatch => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        discoveryDocs: DISCOVERY,
        clientId: CLIENT_ID,
        scope: SCOPE,
      }).then(() => {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
          getClassroomList(dispatch);
        } else {
          gapi.auth2.getAuthInstance().signIn().then(() => getClassroomList(dispatch));
        }
      });
    });
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
      classrooms: action.classrooms,
    };
  }

  return state;
}

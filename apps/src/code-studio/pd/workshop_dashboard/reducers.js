import Permission from './permission';

const SET_PERMISSION = 'pd/workshop_dashboard/SET_PERMISSION';
const SET_FACILITATOR_COURSES = 'pd/workshop_dashboard/SET_FACILITATOR_COURSES';

const initialState = {
  permission: new Permission(),
  facilitatorCourses: []
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PERMISSION:
      return {
        ...state,
        permission: new Permission(action.permissionList)
      };

    case SET_FACILITATOR_COURSES:
      return {
        ...state,
        facilitatorCourses: action.facilitatorCourses
      };

    default:
      return state;
  }
}

export const setPermission = (permissionList) => ({
  type: SET_PERMISSION,
  permissionList
});

export const setFacilitatorCourses = (facilitatorCourses) => ({
  type: SET_FACILITATOR_COURSES,
  facilitatorCourses
});

import Permission from './permission';

const SET_PERMISSION = 'pd/workshop_dashboard/SET_PERMISSION';

const initialState = {
  permission: new Permission()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PERMISSION:
      return {
        ...state,
        permission: new Permission(action.permissionList)
      };

    default:
      return state;
  }
}

export const setPermission = (permissionList) => ({
  type: SET_PERMISSION,
  permissionList
});

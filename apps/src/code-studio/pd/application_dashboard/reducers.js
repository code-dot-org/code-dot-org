const SET_WORKSHOP_ADMIN_PERMISSION = 'application_dashboard/SET_WORKSHOP_ADMIN_PERMISSION';
const SET_LOCK_APPLICATION_PERMISSION = 'application_dashboard/SET_LOCK_APPLICATION_PERMISSION';

const initialState = {

  permissions: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_WORKSHOP_ADMIN_PERMISSION:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          workshopAdmin: action.enabled
        }
      };

    case SET_LOCK_APPLICATION_PERMISSION:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          lockApplication: action.enabled
        }
      };

    default:
      return state;
  }
}
export const setWorkshopAdminPermission = (enabled) => ({
  type: SET_WORKSHOP_ADMIN_PERMISSION,
  enabled
});

export const setLockApplicationPermission = (enabled) => ({
  type: SET_LOCK_APPLICATION_PERMISSION,
  enabled
});

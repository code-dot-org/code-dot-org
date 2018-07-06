import {navigateToHref} from '@cdo/apps/utils';

/** Initial state for manageLinkedAccounts redux store.
 * authenticationOptions - array of authentication options for current user
 * userType - current user's type (student or teacher)
 * userHasPassword - whether or not the user has a code.org password
 * isGoogleClassroomStudent - whether or not the user belongs to a google classroom section
 * isCleverStudent - whether or not the user belongs to a clever section
 */
const initialState = {
  authenticationOptions: {},
  userType: '',
  userHasPassword: false,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
};

const INITIALIZE_STATE = 'manageLinkedAccounts/INITIALIZE_STATE';

export const initializeState = state => ({type: INITIALIZE_STATE, state});

export default function manageLinkedAccounts(state=initialState, action) {
  if (action.type === INITIALIZE_STATE) {
    const {authenticationOptions, userType, userHasPassword, isGoogleClassroomStudent, isCleverStudent} = action.state;
    return {
      ...state,
      authenticationOptions: convertServerAuthOptions(authenticationOptions),
      userType,
      userHasPassword,
      isGoogleClassroomStudent,
      isCleverStudent,
    };
  }

  return state;
}

export const convertServerAuthOptions = (authOptions) => {
  let optionLookup = {};
  authOptions.forEach(option => {
    optionLookup[option.id] = {
      id: option.id,
      credentialType: option.credential_type,
      email: option.email,
      hashedEmail: option.hashed_email,
      error: '',
      isConnecting: false,
      isDisconnecting: false,
    };
  });
  return optionLookup;
};

export const connectProvider = (provider) => {
  navigateToHref(`/users/auth/${provider}/connect`);
};

export const disconnectProvider = (id) => {
  return (dispatch, getState) => {
    disconnectOnServer(id, error => {
      if (error) {
        // set error on authOption with that id
      } else {
        // remove authOption with that id
      }
    });
  };
};

// Make a DELETE request to remove an authentication option by id
export const disconnectOnServer = (id, onComplete) => {
  $.ajax({
    url: `/users/auth/${id}/disconnect`,
    method: 'DELETE'
  }).done(_ => {
    onComplete(null);
  }).fail((jqXhr, _) => {
    if (jqXhr.responseText) {
      onComplete(jqXhr.responseText);
    } else {
      onComplete(`Unexpected failure: ${jqXhr.status}`);
    }
  });
};

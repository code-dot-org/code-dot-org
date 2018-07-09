import $ from 'jquery';
import _ from 'lodash';

/** Initial state for manageLinkedAccounts redux store.
 * authenticationOptions - object of authentication options for current user with id key and authentication option value
 * userHasPassword - whether or not the user has a code.org password
 * isGoogleClassroomStudent - whether or not the user belongs to a google classroom section
 * isCleverStudent - whether or not the user belongs to a clever section
 */
export const initialState = {
  authenticationOptions: {},
  userHasPassword: false,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
};

const INITIALIZE_STATE = 'manageLinkedAccounts/INITIALIZE_STATE';
const REMOVE_AUTH_OPTION = 'manageLinkedAccounts/REMOVE_AUTH_OPTION';
const SET_AUTH_OPTION_ERROR = 'manageLinkedAccounts/SET_AUTH_OPTION_ERROR';

export const initializeState = state => ({type: INITIALIZE_STATE, state});
export const removeAuthOption = id => ({type: REMOVE_AUTH_OPTION, id});
export const setAuthOptionError = (id, error) => ({type: SET_AUTH_OPTION_ERROR, id, error});

export default function manageLinkedAccounts(state=initialState, action) {
  if (action.type === INITIALIZE_STATE) {
    const {authenticationOptions, userHasPassword, isGoogleClassroomStudent, isCleverStudent} = action.state;
    return {
      ...state,
      authenticationOptions,
      userHasPassword,
      isGoogleClassroomStudent,
      isCleverStudent,
    };
  }

  if (action.type === REMOVE_AUTH_OPTION) {
    findAuthOption(state, action.id);
    return {
      ...state,
      authenticationOptions: _.omit(state.authenticationOptions, action.id)
    };
  }

  if (action.type === SET_AUTH_OPTION_ERROR) {
    findAuthOption(state, action.id);
    return {
      ...state,
      authenticationOptions: {
        ...state.authenticationOptions,
        [action.id]: {
          ...state.authenticationOptions[action.id],
          error: action.error
        }
      }
    };
  }

  return state;
}

// Returns authentication option by id
// Throws an error if authentication option is not found
const findAuthOption = (state, id) => {
  const authOption = state.authenticationOptions[id];
  if (!authOption) {
    throw new Error(`Authentication option with id ${id} does not exist`);
  }
  return authOption;
};

export const convertServerAuthOptions = (authOptions) => {
  let optionLookup = {};
  authOptions.forEach(option => {
    optionLookup[option.id] = {
      id: option.id,
      credentialType: option.credential_type,
      email: option.email,
      error: '',
    };
  });
  return optionLookup;
};

export const disconnect = (id) => {
  return (dispatch, _) => {
    disconnectOnServer(id, error => {
      if (error) {
        dispatch(setAuthOptionError(id, error));
      } else {
        dispatch(removeAuthOption(id));
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

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
  personalAccountLinkingEnabled: false,
  lmsName: null,
};

const INITIALIZE_STATE = 'manageLinkedAccounts/INITIALIZE_STATE';

export const initializeState = state => ({type: INITIALIZE_STATE, state});

export default function manageLinkedAccounts(state = initialState, action) {
  if (action.type === INITIALIZE_STATE) {
    const {
      authenticationOptions,
      userHasPassword,
      isGoogleClassroomStudent,
      isCleverStudent,
      personalAccountLinkingEnabled,
      lmsName,
    } = action.state;
    return {
      ...state,
      authenticationOptions,
      userHasPassword,
      isGoogleClassroomStudent,
      isCleverStudent,
      personalAccountLinkingEnabled,
      lmsName,
    };
  }

  return state;
}

export const convertServerAuthOptions = authOptions => {
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

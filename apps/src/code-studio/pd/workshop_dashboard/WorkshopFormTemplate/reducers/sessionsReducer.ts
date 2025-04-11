import {generateNewSession} from '../components/SessionsEditor';
import {SessionFormState, SessionAction} from '../types';

export const sessionsReducer = (
  state: SessionFormState[],
  action: SessionAction
): SessionFormState[] => {
  switch (action.type) {
    case 'ADD_SESSION':
      return state.concat(generateNewSession(state[state.length - 1]));

    case 'UPDATE_SESSION':
      return state.map(session =>
        session.id === action.id ? {...session, ...action.payload} : session
      );

    case 'UPDATE_SESSION_SAME_AS_PREVIOUS':
      return state.map((session, i) =>
        session.id === action.id && state[i - 1]
          ? {
              ...session,
              sameAsPrevious: true,
              meetingLink: state[i - 1].meetingLink,
              locationName: state[i - 1].locationName,
              locationAddress: state[i - 1].locationAddress,
            }
          : session
      );

    case 'DELETE_SESSION':
      return state.filter(session => session.id !== action.id);

    case 'SET_SESSIONS':
      return action.payload;

    default:
      return state;
  }
};

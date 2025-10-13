import {SessionAction, SessionFormState} from '../../workshops/types';
import {generateNewSession} from '../components/SessionsEditor';

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

    case 'DELETE_SESSION':
      return state.filter(session => session.id !== action.id);

    case 'SET_SESSIONS':
      return action.payload;

    default:
      return state;
  }
};

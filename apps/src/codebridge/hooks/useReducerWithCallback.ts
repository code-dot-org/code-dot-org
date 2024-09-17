type ActionType = {
  type: string;
  payload: unknown;
};

/*
  given a reducer and a callback to call _after_ the reducer completes, gives you a new reducer that has the callback.
  Optionally can take a third argument - `omit`, which is a Set of reducer action types for which we do -not- want to fire the callback.
  Otherwise, all options are assumed included.
*/

export const useReducerWithCallback = <StateType>(
  reducer: (state: StateType, action: ActionType) => StateType,
  callback: (state: StateType) => void,
  omit: Set<string> = new Set()
) => {
  return (state: StateType, action: ActionType) => {
    const newState = reducer(state, action);

    if (!omit.has(action.type)) {
      // call the callback asynchronously to ensure we never accidentally access stale state, and also so react doesn't gripe about us
      // updating a different component out of turn.'
      setTimeout(() => callback(newState), 0);
    }
    return newState;
  };
};

export const useReducerWithCallback = <StateType, ActionType>(
  reducer: (state: StateType, action: ActionType) => StateType,
  callback: (state: StateType) => void
) => {
  return (state: StateType, action: ActionType) => {
    const newState = reducer(state, action);
    // It's quite possible that the callback doesn't need to be in the setTimeout, but this is just explicitly not calling it until the newState
    // has come back from the reducer and been processed by dispatch, by deferring the call until the next tick of the run loop.
    //
    // If it was called synchronously here, then theoretically there may be a way to invoke the callback and then be able to access a stale
    // old reducer state before dispatch has finished. Or maybe it's not possible. :shrug:
    setTimeout(() => callback(newState), 0);
    return newState;
  };
};

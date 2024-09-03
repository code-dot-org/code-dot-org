export const useReducerWithCallback = <StateType, ActionType>(
  reducer: (state: StateType, action: ActionType) => StateType,
  callback: (state: StateType) => void
) => {
  return (state: StateType, action: ActionType) => {
    const newState = reducer(state, action);
    setTimeout(() => callback(newState), 0);
    return newState;
  };
};

const COLLECTOR_RESET_CURRENT_COLLECTED = 'maze/COLLECTOR_RESET_CURRENT_COLLECTED';
const COLLECTOR_SET_CURRENT_COLLECTED = 'maze/COLLECTOR_SET_CURRENT_COLLECTED';
const COLLECTOR_SET_MIN_REQUIRED = 'maze/COLLECTOR_SET_MIN_REQUIRED';

const mazeInitialState = {
  collectorCurrentCollected: 0,
  collectorBestCollected: 0,
  collectorMinRequired: 1,
};

export default function reducer(state = mazeInitialState, action) {
  if (action.type === COLLECTOR_RESET_CURRENT_COLLECTED) {
    return { ...state, collectorCurrentCollected: 0 };
  }

  if (action.type === COLLECTOR_SET_CURRENT_COLLECTED) {
    return {
      ...state,
      collectorCurrentCollected: action.currentCollected,
      collectorLastCollected: action.currentCollected,
    };
  }

  if (action.type === COLLECTOR_SET_MIN_REQUIRED) {
    return { ...state, collectorMinRequired: action.minRequired };
  }

  return state;
}

export const resetCollectorCurrentCollected = () => ({
  type: COLLECTOR_RESET_CURRENT_COLLECTED,
});

export const setCollectorCurrentCollected = currentCollected => ({
  type: COLLECTOR_SET_CURRENT_COLLECTED,
  currentCollected
});

export const setCollectorMinRequired = minRequired => ({
  type: COLLECTOR_SET_MIN_REQUIRED,
  minRequired
});

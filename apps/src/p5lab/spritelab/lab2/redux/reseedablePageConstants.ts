import {AnyAction} from 'redux';

import legacyPageConstants from '@cdo/apps/redux/pageConstants';

// The legacy module doesn't export its initial state; derive it.
const initialState = legacyPageConstants(undefined, {type: '@@INIT'});

// Patch over the legacy pageConstants reducer for Lab2's in-place level
// switches: the legacy reducer forbids changing a key once set and has no
// reset, so the lab's seeding effect resets the slice (in its cleanup)
// before every seed.
export const RESET_PAGE_CONSTANTS = 'spriteLab2/resetPageConstants';

export default function reseedablePageConstants(
  state: ReturnType<typeof legacyPageConstants> | undefined,
  action: AnyAction
) {
  if (action.type === RESET_PAGE_CONSTANTS) {
    return initialState;
  }
  return legacyPageConstants(state, action);
}

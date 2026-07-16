import {AnyAction} from 'redux';

import legacyPageConstants from '@cdo/apps/redux/pageConstants';

// The legacy module doesn't export its initial state; derive it.
const initialState = legacyPageConstants(undefined, {type: '@@INIT'});

// The legacy pageConstants reducer forbids changing a key once set — it
// assumes one page load per level, and offers no reset action. Lab2 switches
// levels in place and this lab seeds the slice with each level's channel, so
// the lab's seeding effect resets the slice (in its cleanup) before every
// re-seed. Seeding from useSources' channel keeps the reset/seed pair safe:
// the view unmounts while the next level's project loads, so nothing can
// re-seed a stale channel between the two.
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

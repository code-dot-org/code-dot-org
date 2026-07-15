import {AnyAction} from 'redux';

import legacyPageConstants from '@cdo/apps/redux/pageConstants';

// The legacy module doesn't export its initial state; derive it.
const initialState = legacyPageConstants(undefined, {type: '@@INIT'});

// The legacy pageConstants reducer forbids changing a key once set — it
// assumes one page load per level. Lab2 switches levels in place and this
// lab re-seeds the slice for each level's channel, so a rejected change is
// re-applied from the initial state instead (last write wins). Violations
// the legacy reducer rejects outright, like disallowed keys, throw again on
// the retry and so still throw here.
export default function reseedablePageConstants(
  state: ReturnType<typeof legacyPageConstants> | undefined,
  action: AnyAction
) {
  try {
    return legacyPageConstants(state, action);
  } catch {
    return legacyPageConstants(initialState, action);
  }
}

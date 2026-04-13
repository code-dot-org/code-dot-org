import Lab2Registry from '../Lab2Registry';

import {LifecycleEvent} from './LifecycleNotifier';

// Requests navigation to another level.
// Returns false if any BeforeLevelChange listener vetoes navigation.
export default async function requestLevelNavigation() {
  return Lab2Registry.getInstance()
    .getLifecycleNotifier()
    .request(LifecycleEvent.BeforeLevelChange);
}

import Lab2Registry from '../Lab2Registry';

import {LifecycleEvent} from './LifecycleNotifier';

// Function for external components to notify the Lab2 lifecycle notifier that the level is changing.
export default function notifyLevelChange(
  previousLevelId: string | null,
  nextLevelId: string
) {
  Lab2Registry.getInstance()
    .getLifecycleNotifier()
    .notify(LifecycleEvent.LevelChangeRequested, previousLevelId, nextLevelId);
}

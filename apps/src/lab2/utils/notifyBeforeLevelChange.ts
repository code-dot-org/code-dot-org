import Lab2Registry from '../Lab2Registry';

import {LifecycleEvent} from './LifecycleNotifier';

// Function for external components to notify the Lab2 lifecycle notifier that a level change is about to happen.
// Returns false if any listener vetoes the change.
export default function notifyBeforeLevelChange(
  previousLevelId: string | null,
  nextLevelId: string
) {
  return Lab2Registry.getInstance()
    .getLifecycleNotifier()
    .notify(LifecycleEvent.BeforeLevelChange, previousLevelId, nextLevelId);
}

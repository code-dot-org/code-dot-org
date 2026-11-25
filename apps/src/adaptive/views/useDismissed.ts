import {useCallback, useState} from 'react';

import {tryGetLocalStorage} from '@cdo/apps/utils';

/** The local storage key that remembers a callout's dismissal for a student on a pathway. */
export const dismissedKey = (
  callout: string,
  userId: number,
  pathwayId: string
): string => `adaptive-${callout}-callout-dismissed-v1:${userId}:${pathwayId}`;

/**
 * Whether a callout has been dismissed on this browser by this student for
 * this pathway, and a function that dismisses it. Without a user id, or
 * where storage cannot be written, the dismissal lasts the visit.
 */
export default function useDismissed(
  callout: string,
  userId: number | null | undefined,
  pathwayId: string
): [boolean, () => void] {
  const key = userId ? dismissedKey(callout, userId, pathwayId) : null;
  const [dismissed, setDismissed] = useState(
    () => !!key && tryGetLocalStorage(key, '0') === '1'
  );
  const dismiss = useCallback(() => {
    if (key) {
      try {
        localStorage.setItem(key, '1');
      } catch {
        // Private mode or a full store; the visit still gets its dismissal.
      }
    }
    setDismissed(true);
  }, [key]);
  return [dismissed, dismiss];
}

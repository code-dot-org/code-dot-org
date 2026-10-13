// The progress widget draws the lab's Continue button in the header, a
// separate React root. The lab's NavigationArea still decides the button's
// label, state and action: it publishes the first two to redux and answers
// the header's click through a window event. When several NavigationAreas
// are mounted, the most recently mounted one answers.

import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react';

const HEADER_CONTINUE_EVENT = 'cdo:headerContinue';

let owners: symbol[] = [];
const ownerListeners = new Set<() => void>();

function notifyOwners() {
  ownerListeners.forEach(listener => listener());
}

function subscribeToOwners(listener: () => void) {
  ownerListeners.add(listener);
  return () => {
    ownerListeners.delete(listener);
  };
}

/** Called by the header's Continue button. */
export function requestHeaderContinue() {
  window.dispatchEvent(new Event(HEADER_CONTINUE_EVENT));
}

/** Whether this component is the one that answers the header's Continue. */
export function useOwnsHeaderNavigation(): boolean {
  const token = useRef(Symbol('headerNavigationOwner')).current;

  useEffect(() => {
    owners = [...owners, token];
    notifyOwners();
    return () => {
      owners = owners.filter(owner => owner !== token);
      notifyOwners();
    };
  }, [token]);

  return useSyncExternalStore(
    subscribeToOwners,
    useCallback(() => owners[owners.length - 1] === token, [token])
  );
}

/** Runs onContinue when the header's Continue is clicked, if given one. */
export function useHeaderContinue(onContinue: (() => void) | undefined) {
  useEffect(() => {
    if (!onContinue) {
      return;
    }
    window.addEventListener(HEADER_CONTINUE_EVENT, onContinue);
    return () => window.removeEventListener(HEADER_CONTINUE_EVENT, onContinue);
  }, [onContinue]);
}

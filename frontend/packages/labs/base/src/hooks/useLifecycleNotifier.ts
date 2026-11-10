import {useEffect} from 'react';

import LabRegistry from '../LabRegistry';
import type {Callback, LifecycleEventType} from '../LifecycleNotifier';

// A hook to add a lifecycle notifier listener when the component mounts
// and remove it when the component unmounts.
export default function useLifecycleNotifier<T extends LifecycleEventType>(
  event: T,
  callback: Callback<T>,
) {
  useEffect(() => {
    LabRegistry.lifecycleNotifier.addListener(event, callback);

    return () => {
      LabRegistry.lifecycleNotifier.removeListener(event, callback);
    };
  }, [event, callback]);
}

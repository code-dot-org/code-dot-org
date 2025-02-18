import {useEffect} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {Callback, LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';

// A hook to add a lifecycle notifier listener when the component mounts
// and remove it when the component unmounts.
export default function useLifecycleNotifier<T extends LifecycleEvent>(
  event: T,
  callback: Callback<T>
) {
  useEffect(() => {
    Lab2Registry.getInstance()
      .getLifecycleNotifier()
      .addListener(event, callback);

    return () => {
      Lab2Registry.getInstance()
        .getLifecycleNotifier()
        .removeListener(event, callback);
    };
  }, [event, callback]);
}

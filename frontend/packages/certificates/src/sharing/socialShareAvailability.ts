import {useEffect, useState} from 'react';

import {checkIfURLIsBlocked} from '@code-dot-org/component-library/common/helpers';

export function useSocialShareAvailability(faviconUrl: string): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkIfURLIsBlocked(faviconUrl).then(blocked => {
      if (mounted) {
        setAvailable(!blocked);
      }
    });

    return () => {
      mounted = false;
    };
  }, [faviconUrl]);

  return available;
}

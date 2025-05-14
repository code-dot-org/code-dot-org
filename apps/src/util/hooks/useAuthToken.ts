import {useEffect, useMemo, useState} from 'react';

import {getAuthenticityToken} from '../AuthenticityTokenStore';

export const useAuthToken = (optionOverrides?: RequestInit) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getAuthenticityToken();
      setAuthToken(token);
    };
    fetchToken();
  }, []);

  const options: RequestInit | undefined = useMemo(
    () =>
      authToken
        ? {
            ...optionOverrides,
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': authToken,
              ...(optionOverrides?.headers ?? {}),
            },
          }
        : undefined,
    [authToken, optionOverrides]
  );

  return {authToken, options};
};

import type {FunctionComponent, PropsWithChildren} from 'react';
import {
  useEffect,
  useCallback,
  useState,
  createContext,
  useContext,
} from 'react';

import {retrieveToken, refreshToken} from '@code-dot-org/api';

/**
 * Describes the state of the user.
 */
export interface CSRFContent {
  token?: string;
  refreshToken: () => void;
}

/**
 * The current lab application metadata.
 */
const CSRFContext = createContext<CSRFContent>({
  refreshToken: () => {},
});

/**
 * This hook returns the user state.
 */
export const useCSRF = () => {
  return useContext(CSRFContext);
};

/**
 * Holds the user state.
 */
export const CSRFProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [token, setToken] = useState<string | undefined>(undefined);

  const internalRefreshToken = useCallback(
    () =>
      (async () => {
        // Get a new token
        setToken(await refreshToken());
      })(),
    [setToken],
  );

  useEffect(() => {
    (async () => {
      // Get initial token
      setToken(await retrieveToken());
    })();
  }, [setToken]);

  return (
    <CSRFContext.Provider
      value={{
        token,
        refreshToken: internalRefreshToken,
      }}
    >
      {children}
    </CSRFContext.Provider>
  );
};

export default CSRFContext;

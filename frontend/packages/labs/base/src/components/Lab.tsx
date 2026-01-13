import type {FunctionComponent, PropsWithChildren} from 'react';
import {Suspense} from 'react';

import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {RootStateProvider} from '@code-dot-org/redux/providers';

import {ExtraLinksButtonProvider} from '../contexts/ExtraLinksButtonContext';

import Loading from './Loading';

export interface LabProps extends PropsWithChildren {
  isLoading: boolean;
}

/**
 * A wrapper for any lab that will connect it to the appropriate data sources
 * and contexts.
 */
const Lab: FunctionComponent<LabProps> = ({isLoading, children}) => {
  return (
    <Suspense fallback={<Loading isLoading={isLoading} />}>
      {!isLoading && (
        /* Redux */
        <RootStateProvider>
          {/* UI theming */}
          <ThemeProvider>
            {/* Supports extra links buttons and toggling */}
            <ExtraLinksButtonProvider>{children}</ExtraLinksButtonProvider>
          </ThemeProvider>
        </RootStateProvider>
      )}
    </Suspense>
  );
};

export default Lab;

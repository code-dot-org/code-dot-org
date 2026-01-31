import type {PropsWithChildren} from 'react';
import {Suspense, useEffect} from 'react';

import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {injectFontAwesome} from '@code-dot-org/fonts';
import {progressActions} from '@code-dot-org/progress/redux';
import {RootStateProvider} from '@code-dot-org/redux/providers';

import {ExtraLinksButtonProvider} from '../contexts/ExtraLinksButtonContext';
import {LevelPropertiesProvider} from '../contexts/LevelPropertiesContext';
import {useAppDispatch} from '../redux/store';

import Loading from './Loading';

interface LabWrapperProps extends PropsWithChildren {
  levelId?: string;
  standaloneProjectType?: string;
}

const LabWrapper = ({
  levelId,
  standaloneProjectType,
  children,
}: LabWrapperProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Set the level id if it is known
    if (levelId) {
      dispatch(progressActions.setCurrentLevelId(parseInt(levelId)));
    }
  }, [dispatch, levelId]);

  useEffect(() => {
    // Set the level id if it is known
    if (standaloneProjectType) {
      dispatch(progressActions.setStandaloneProjectType(standaloneProjectType));
    }
  }, [dispatch, standaloneProjectType]);

  return children;
};

export interface LabProps extends PropsWithChildren {
  /** Whether or not the lab considers itself loading */
  isLoading: boolean;
  /** The level id */
  levelId?: string;
  /** The standalone project type, if not a particular level */
  standaloneProjectType?: string;
  /** Optionally, a channel id for a standalone level */
  channelId?: string;
}

/**
 * A wrapper for any lab that will connect it to the appropriate data sources
 * and contexts.
 */
const Lab = ({
  isLoading,
  levelId,
  standaloneProjectType,
  children,
}: LabProps) => {
  // Ensure FontAwesome icons are available for all labs
  useEffect(() => {
    injectFontAwesome();
  }, []);

  return (
    <Suspense fallback={<Loading isLoading={isLoading} />}>
      {!isLoading && (
        /* Redux */
        <RootStateProvider>
          {/* UI theming */}
          <ThemeProvider>
            {/* Supports extra links buttons and toggling */}
            <ExtraLinksButtonProvider>
              <LevelPropertiesProvider>
                {/* The actual lab content */}
                <LabWrapper
                  levelId={levelId}
                  standaloneProjectType={standaloneProjectType}
                >
                  {children}
                </LabWrapper>
              </LevelPropertiesProvider>
            </ExtraLinksButtonProvider>
          </ThemeProvider>
        </RootStateProvider>
      )}
    </Suspense>
  );
};

export default Lab;

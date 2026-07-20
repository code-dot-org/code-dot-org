import type {PropsWithChildren} from 'react';
import {Suspense, useEffect} from 'react';

import {BrowserTextToSpeechWrapper} from '@code-dot-org/audio/textToSpeech';
import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import {injectFontAwesome} from '@code-dot-org/fonts';
import {progressActions} from '@code-dot-org/progress/redux';

import {DialogControlProvider} from '../contexts/DialogControlContext';
import {ExtraLinksButtonProvider} from '../contexts/ExtraLinksButtonContext';
import {LevelPropertiesProvider} from '../contexts/LevelPropertiesContext';
import DialogViews from '../dialogs/DialogViews';
import {useAppDispatch} from '../redux/store';

import Loading from './Loading';
import LoadingOverlay from './LoadingOverlay';

interface LabWrapperProps extends PropsWithChildren {
  levelId?: string | number;
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
      dispatch(
        progressActions.setCurrentLevelId(
          typeof levelId === 'number' ? levelId : parseInt(levelId),
        ),
      );
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
  /**
   * Whether the lab considers itself loading. Optional: the Studio host renders
   * `<Lab>` with no props and lets Suspense handle it, while labs that track
   * their own load state pass it to get the fade overlay.
   */
  isLoading?: boolean;
  /** The level id. Accepts a number, as the Studio host's routes supply. */
  levelId?: string | number;
  /** The standalone project type, if not a particular level */
  standaloneProjectType?: string;
  /**
   * Resolved level-properties map, supplied by the host. The package performs
   * no level-properties fetching of its own.
   */
  levelPropertiesMap?: LevelPropertiesMap;
  /** Host-supplied error reporting, used by the error boundary. */
  onError?: (error: Error, componentStack: string) => void;
}

/**
 * A wrapper for any lab that will connect it to the appropriate data sources
 * and contexts.
 *
 * The host (e.g. the studio app) owns the redux store and must render this
 * component inside a `RootStateProvider` from `@code-dot-org/core/redux`.
 * Importing this package injects the lab slices into the shared store, so the
 * host only needs to provide the store, not assemble it. `<Lab>` deliberately
 * does not provide the store itself: a single host-owned provider keeps one
 * source of truth and lets the host coordinate the lab with the rest of the
 * page (progress, header, etc.).
 */
const Lab = ({
  isLoading = false,
  levelId,
  standaloneProjectType,
  levelPropertiesMap,
  children,
}: LabProps) => {
  // Ensure FontAwesome icons are available for all labs
  useEffect(() => {
    injectFontAwesome();
  }, []);

  // The actual lab content, wrapped to set the current level identity in redux.
  const labContent = (
    <LabWrapper levelId={levelId} standaloneProjectType={standaloneProjectType}>
      {children}
    </LabWrapper>
  );

  return (
    <Suspense fallback={isLoading ? <LoadingOverlay isLoading /> : <Loading />}>
      {!isLoading && (
        /* UI theming */
        <ThemeProvider>
          {/* Supports extra links buttons and toggling */}
          <ExtraLinksButtonProvider>
            {/* The host supplies the resolved level-properties map. */}
            <LevelPropertiesProvider levelPropertiesMap={levelPropertiesMap}>
              {/* Manages the shared lab dialogs (Start Over, Skip, Share, …);
                  without it `useDialogControl().showDialog` is a no-op. */}
              <DialogControlProvider dialogViews={DialogViews}>
                {/* Provides browser text-to-speech availability to the
                    instructions' TextToSpeech buttons. */}
                <BrowserTextToSpeechWrapper>
                  {labContent}
                </BrowserTextToSpeechWrapper>
              </DialogControlProvider>
            </LevelPropertiesProvider>
          </ExtraLinksButtonProvider>
        </ThemeProvider>
      )}
    </Suspense>
  );
};

export default Lab;

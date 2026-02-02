import {isEqual} from 'lodash';
import type {PropsWithChildren} from 'react';
import {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';

import type {
  Channel,
  ProjectSources,
  LevelProperties,
} from '@code-dot-org/core/api';
import type {ProjectManager} from '@code-dot-org/projects';

import StartOverDialog from '../dialogs/components/StartOverDialog';
import useLifecycleNotifier from '../hooks/useLifecycleNotifier';
import LabRegistry from '../LabRegistry';
import {LifecycleEvent} from '../LifecycleNotifier';
import {labActions} from '../redux';
import {useAppSelector} from '../redux/store';
import type {LabProps} from '../types';
import {getInitialSources as defaultGetInitialSources} from '../utils';

export type MessageType = 'text' | 'blocks' | 'custom';

// TODO: get this from app_options
//const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isStartMode = false;

/**
 * Describes the state of the sources available in the current lab.
 */
export interface SourcesContent<T = string> {
  currentSources: ProjectSources<T>;
  updateSources: (newSources: ProjectSources<T>, forceSave?: boolean) => void;
  showStartOverDialog: (type: MessageType, message?: string) => void;
  setReinitializationHandler: (handler: () => void) => void;
  startOver: () => void;
}

/**
 * The current lab sources metadata.
 */
const SourcesContext = createContext<SourcesContent>({
  currentSources: {
    source: '',
  },
  updateSources: (_, __) => {},
  showStartOverDialog: (_, __) => {},
  setReinitializationHandler: _ => {},
  startOver: () => {},
});

/**
 * This hook returns the current lab sources.
 */
export const useSources = <T = string,>() => {
  return useContext(SourcesContext) as unknown as SourcesContent<T>;
};

export interface SourcesProviderProps<
  T extends LevelProperties = LevelProperties,
  U = string,
> extends LabProps<T, U> {
  defaultSources: ProjectSources<U>;
  /**
   * Optionally supply a custom ProjectManager to use in place of the LabRegistry's ProjectManager.
   * Currently only used in very specific multi-project scenarios.
   */
  projectManager?: ProjectManager;
  /** How to determine the initial sources */
  getInitialSources?: (
    levelProperties: T,
    projectSources?: ProjectSources<U>,
  ) => ProjectSources<U> | undefined;
  /** The callback to determine initial sources to use when starting over */
  startOverSources?: (levelProperties: T) => ProjectSources<U>;
  /** The message to display when potentially starting over. */
  defaultStartOverMessage?: string;
  /** A transformer to parse the sources into the typed ProjectSources form expected */
  transform?: (projectSources: ProjectSources<U>) => ProjectSources<U>;
}

export const STARTOVER_WORKSPACE_TEXT_MESSAGE =
  "This will reset the workspace to its start state and remove all the code you've added or changed.";

/**
 * Holds the sources for a lab.
 */
export const SourcesProvider = <
  T extends LevelProperties = LevelProperties,
  U = string,
>({
  levelProperties,
  initialSources,
  defaultSources,
  projectManager,
  getInitialSources,
  startOverSources,
  defaultStartOverMessage,
  transform,
  children,
}: SourcesProviderProps<T, U> & PropsWithChildren) => {
  const [currentSources, setCurrentSources] = useState<ProjectSources<U>>(
    () =>
      (getInitialSources || defaultGetInitialSources<T, U>)(
        levelProperties,
        initialSources,
      ) || defaultSources,
  );

  getInitialSources ||= defaultGetInitialSources;

  // When we use this value to decide whether to save sources or not,
  // we want to make sure that we have the most up-to-date version of the readonly state of the workspace.
  // In order to achieve this, we re-fetch the current value and save it to a ref on each render.
  const readonlyWorkspace = useAppSelector(labActions.isReadOnlyWorkspace);
  const readonlyWorkspaceRef = useRef(readonlyWorkspace);
  readonlyWorkspaceRef.current = readonlyWorkspace;

  const [startOverMessage, setStartOverMessage] = useState<string | undefined>(
    undefined,
  );

  const reinitializationHandler = useRef<() => void | null>(null);
  const setReinitializationHandler = useCallback((handler: () => void) => {
    reinitializationHandler.current = handler;
  }, []);

  const reinitializeSources = useCallback(
    (sources: ProjectSources<U>, save: boolean = false) => {
      setCurrentSources(transform?.(sources) || sources);
      if (save && !readonlyWorkspaceRef.current) {
        (projectManager || LabRegistry.projectManager)?.save(
          sources as ProjectSources,
          true,
        );
      }

      if (reinitializationHandler.current) {
        reinitializationHandler.current();
      }
    },
    [projectManager, transform, setCurrentSources, reinitializationHandler],
  );

  useEffect(() => {
    reinitializeSources(
      (getInitialSources || defaultGetInitialSources<T, U>)(
        levelProperties,
        initialSources,
      ) || defaultSources,
    );
  }, [
    getInitialSources,
    reinitializeSources,
    levelProperties,
    initialSources,
    defaultSources,
  ]);

  // Sources to reset to when starting over. Depends on the level edit mode.
  const memoizedStartOverSources: ProjectSources<U> = useMemo(() => {
    if (startOverSources) {
      return startOverSources(levelProperties);
    }

    const {templateSources, startSources} = levelProperties;
    return isStartMode
      ? defaultSources
      : ((templateSources ||
          startSources ||
          defaultSources) as ProjectSources<U>);
  }, [startOverSources, defaultSources, levelProperties]);

  const updateSources = useCallback(
    (newSources: ProjectSources<U>, forceSave = false) => {
      setCurrentSources(prev => {
        const transformed = transform?.(newSources) || newSources;

        // Perform a deep equality check to prevent unnecessary re-renders
        if (isEqual(prev, transformed)) {
          return prev;
        }

        return transformed;
      });

      if (!readonlyWorkspaceRef.current) {
        (projectManager || LabRegistry.projectManager)?.save(
          newSources as ProjectSources,
          forceSave,
        );
      }
    },
    [setCurrentSources, transform, projectManager],
  );

  const onLevelLoad = useCallback(
    (
      _levelProperties?: LevelProperties,
      _channel?: Channel,
      initialSources?: ProjectSources,
    ) => {
      updateSources(initialSources as ProjectSources<U>);
    },
    [updateSources],
  );

  // When the level changes, reflect the loaded initialSources
  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, onLevelLoad);

  const onStartOver = useCallback(() => {
    reinitializeSources(memoizedStartOverSources as ProjectSources<U>, true);
    setStartOverMessage(undefined);
  }, [reinitializeSources, memoizedStartOverSources]);

  const showStartOverDialog = useCallback(
    (message?: string) => {
      setStartOverMessage(message || defaultStartOverMessage);
    },
    [defaultStartOverMessage, setStartOverMessage],
  );

  const TypedContext = SourcesContext as unknown as ReturnType<
    typeof createContext<SourcesContent<U>>
  >;

  return (
    <TypedContext.Provider
      value={{
        currentSources,
        updateSources,
        showStartOverDialog,
        setReinitializationHandler,
        startOver: onStartOver,
      }}
    >
      {children}
      {startOverMessage !== undefined && (
        <StartOverDialog
          onConfirm={onStartOver}
          onCancel={() => setStartOverMessage(undefined)}
          message={
            startOverMessage ||
            defaultStartOverMessage ||
            STARTOVER_WORKSPACE_TEXT_MESSAGE
          }
        />
      )}
    </TypedContext.Provider>
  );
};

export default SourcesContext;

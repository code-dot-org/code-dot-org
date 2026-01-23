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

import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import type {ProjectManager, ProjectSources} from '@code-dot-org/projects';

import {START_SOURCES} from '../constants';
import StartOverDialog from '../dialogs/components/StartOverDialog';
import LabRegistry from '../LabRegistry';
import {labActions} from '../redux';
import {useAppSelector} from '../redux/store';
import {LevelProperties, LabProps} from '../types';
import {getInitialSources as defaultGetInitialSources} from '../utils';

export type MessageType = 'text' | 'blocks' | 'custom';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

/**
 * Describes the state of the sources available in the current lab.
 */
export interface SourcesContent<T extends ProjectSources = ProjectSources> {
  currentSources: T;
  updateSources: (newSources: T, forceSave?: boolean) => void;
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
export const useSources = <T extends ProjectSources = ProjectSources>() => {
  return useContext(SourcesContext) as unknown as SourcesContent<T>;
};

export interface SourcesProviderProps<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
> extends LabProps<T, U> {
  defaultSources: U;
  /**
   * Optionally supply a custom ProjectManager to use in place of the LabRegistry's ProjectManager.
   * Currently only used in very specific multi-project scenarios.
   */
  projectManager?: ProjectManager;
  /** How to determine the initial sources */
  getInitialSources?: (levelProperties: T, projectSources?: U) => U | undefined;
  /** The sources to use when starting over */
  startOverSources?: U;
  /** The message to display when potentially starting over. */
  defaultStartOverMessage?: string;
}

export const STARTOVER_WORKSPACE_TEXT_MESSAGE =
  "This will reset the workspace to its start state and remove all the code you've added or changed.";

/**
 * Holds the sources for a lab.
 */
export const SourcesProvider = <
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>({
  levelProperties,
  initialSources,
  defaultSources,
  projectManager,
  getInitialSources,
  startOverSources,
  defaultStartOverMessage,
  children,
}: SourcesProviderProps<T, U> & PropsWithChildren) => {
  const [currentSources, setCurrentSources] = useState<U>(
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

  const [startOverMessage, setStartOverMessage] = useState<string | undefined>(undefined);

  const reinitializationHandler = useRef<() => void | null>(null);
  const setReinitializationHandler = useCallback((handler: () => void) => {
    reinitializationHandler.current = handler;
  }, []);

  const reinitializeSources = useCallback(
    (sources: U, save: boolean = false) => {
      setCurrentSources(sources);
      if (save && !readonlyWorkspaceRef.current) {
        (projectManager || LabRegistry.projectManager)?.save(sources, true);
      }

      if (reinitializationHandler.current) {
        reinitializationHandler.current();
      }
    },
    [projectManager, setCurrentSources, reinitializationHandler],
  );

  useEffect(() => {
    reinitializeSources(
      (getInitialSources || defaultGetInitialSources<T, U>)(
        levelProperties,
        initialSources,
      ) || defaultSources,
    );
  }, [reinitializeSources, levelProperties, initialSources, defaultSources]);

  // Sources to reset to when starting over. Depends on the level edit mode.
  const memoizedStartOverSources: U = useMemo(() => {
    if (startOverSources) {
      return startOverSources;
    }

    const {templateSources, startSources} = levelProperties;
    return isStartMode
      ? defaultSources
      : ((templateSources || startSources || defaultSources) as U);
  }, [startOverSources, defaultSources, levelProperties]);

  const updateSources = useCallback(
    (newSources: U, forceSave = false) => {
      setCurrentSources(prev => {
        // Perform a deep equality check to prevent unnecessary re-renders
        if (isEqual(prev, newSources)) {
          return prev;
        }
        return newSources;
      });

      if (!readonlyWorkspaceRef.current) {
        (projectManager || LabRegistry.projectManager)?.save(
          newSources,
          forceSave,
        );
      }
    },
    [setCurrentSources, projectManager],
  );

  const onStartOver = useCallback(() => {
    reinitializeSources(memoizedStartOverSources as U, true);
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
            startOverMessage || defaultStartOverMessage || STARTOVER_WORKSPACE_TEXT_MESSAGE
          }
        />
      )}
    </TypedContext.Provider>
  );
};

export default SourcesContext;

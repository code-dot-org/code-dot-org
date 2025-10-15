import {isEqual} from 'lodash';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

import {toolboxToWorkspaceBlocks} from '@cdo/apps/blockly/utils/toolbox';
import {START_SOURCES, TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  BlocklyLevelProperties,
  LabProps,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import StartOverDialog, {
  MessageType,
} from '@cdo/apps/lab2/views/dialogs/dsco/StartOverDialog';

import getInitialSources from '../utils/getInitialSources';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

interface SourcesContextType<T extends ProjectSources = ProjectSources> {
  currentSources: T;
  updateSources: (newSources: T, forceSave?: boolean) => void;
  showStartOverDialog: (type: MessageType, message?: string) => void;
  setReinitializationHandler: (handler: () => void) => void;
}

const SourcesContext = createContext<SourcesContextType | null>(null);

export function useSources<T extends ProjectSources = ProjectSources>() {
  const context = useContext(SourcesContext);
  if (context === null) {
    throw new Error('useSources must be used within a SourcesProvider');
  }
  // The SourcesContext object has to be created without a specific type,
  // so TS complains about casting context to a parameterized type.
  // Cast to unknown to get the correctly typed object.
  return context as unknown as SourcesContextType<T>;
}

/**
 * Manages sources for a Lab.
 */
const SourcesContainer: React.FC<
  LabProps & {
    children: ReactNode;
    defaultSources: ProjectSources;
  }
> = ({levelProperties, initialSources, defaultSources, children}) => {
  const [currentSources, setCurrentSources] = useState<ProjectSources>(
    () => getInitialSources(levelProperties, initialSources) || defaultSources
  );

  const [startOverProps, setStartOverProps] = useState<{
    type: MessageType;
    message?: string;
  }>();

  const reinitializationHandler = useRef<() => void>();
  const setReinitializationHandler = useCallback((handler: () => void) => {
    reinitializationHandler.current = handler;
  }, []);

  const reinitializeSources = useCallback(
    (sources: ProjectSources, save: boolean = false) => {
      setCurrentSources(sources);
      if (save) {
        Lab2Registry.getInstance().getProjectManager()?.save(sources, true);
      }

      if (reinitializationHandler.current) {
        reinitializationHandler.current();
      }
    },
    [setCurrentSources, reinitializationHandler]
  );

  useEffect(() => {
    reinitializeSources(
      getInitialSources(levelProperties, initialSources) || defaultSources
    );
  }, [reinitializeSources, levelProperties, initialSources, defaultSources]);

  // Sources to reset to when starting over. Depends on the level edit mode.
  const startOverSources: ProjectSources = useMemo(() => {
    const {templateSources, startSources} = levelProperties;
    if (isToolboxMode) {
      return {
        source: toolboxToWorkspaceBlocks(
          (levelProperties as BlocklyLevelProperties).toolboxDefinition
        ),
      };
    }
    return isStartMode
      ? defaultSources
      : ((templateSources || startSources || defaultSources) as ProjectSources);
  }, [defaultSources, levelProperties]);

  const updateSources = useCallback(
    (newSources: ProjectSources, forceSave = false) => {
      setCurrentSources(prev => {
        // Perform a deep equality check to prevent unnecessary re-renders
        if (isEqual(prev, newSources)) {
          return prev;
        }
        return newSources;
      });
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(newSources, forceSave);
    },
    [setCurrentSources]
  );

  const onStartOver = useCallback(() => {
    reinitializeSources(startOverSources as ProjectSources, true);
    setStartOverProps(undefined);
  }, [reinitializeSources, startOverSources]);

  const showStartOverDialog = useCallback(
    (type: MessageType, message?: string) => {
      setStartOverProps({type, message});
    },
    []
  );

  return (
    <SourcesContext.Provider
      value={{
        currentSources,
        updateSources,
        showStartOverDialog,
        setReinitializationHandler,
      }}
    >
      {children}
      {startOverProps && (
        <StartOverDialog
          onConfirm={onStartOver}
          onCancel={() => setStartOverProps(undefined)}
          {...startOverProps}
        />
      )}
    </SourcesContext.Provider>
  );
};

export default SourcesContainer;

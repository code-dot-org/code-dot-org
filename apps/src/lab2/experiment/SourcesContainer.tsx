import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {getCurrentScriptLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ProjectManager from '../projects/ProjectManager';
import ProjectManagerFactory from '../projects/ProjectManagerFactory';
import {ProjectAndSources, ProjectSources} from '../types';

interface SourcesContextType {
  sources: ProjectSources | undefined;
  channelId: string | undefined;
  isLoading: boolean;
  updateSources: (sources: ProjectSources, forceSave?: boolean) => void;
}

const SourcesContext = React.createContext<SourcesContextType | undefined>(
  undefined
);

interface SourcesContainerProps {
  children: React.ReactNode;
  usesProjects: boolean;
  standaloneChannelId?: string;
}

const SourcesContainer: React.FC<SourcesContainerProps> = ({
  children,
  usesProjects,
  standaloneChannelId,
}) => {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const userId = useAppSelector(state => state.currentUser.userId);
  const scriptId = useAppSelector(
    state => state.progress.scriptId || undefined
  );
  const scriptLevelId = useAppSelector(getCurrentScriptLevelId);

  const [projectData, setProjectData] = useState<ProjectAndSources | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const projectManagerRef = useRef<ProjectManager | null>(null);

  const loadProject = useCallback(async () => {
    if (!usesProjects) {
      return;
    }
    if (!currentLevelId) {
      return;
    }

    projectManagerRef.current?.cleanUp();

    projectManagerRef.current = standaloneChannelId
      ? ProjectManagerFactory.getProjectManager(standaloneChannelId)
      : await ProjectManagerFactory.getProjectManagerForLevel(
          parseInt(currentLevelId),
          userId,
          scriptId,
          scriptLevelId
        );
    if (!projectManagerRef.current) {
      return;
    }

    return await projectManagerRef.current.load();
  }, [
    currentLevelId,
    userId,
    scriptId,
    scriptLevelId,
    usesProjects,
    standaloneChannelId,
  ]);

  useEffect(() => {
    setIsLoading(true);
    setProjectData(undefined);
    loadProject()
      .then(data => {
        setProjectData(data);
      })
      .catch(error => {
        // TODO Error handling
        console.error('Failed to load project sources:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadProject]);

  const updateSources = useCallback(
    (newSources: ProjectSources, forceSave = false) => {
      setProjectData(prevData => {
        if (!prevData) {
          console.warn('No project data available to update sources.');
          return prevData;
        }
        return {
          ...prevData,
          sources: newSources,
        };
      });
      projectManagerRef.current?.save(newSources, forceSave);
    },
    [setProjectData]
  );

  return (
    <SourcesContext.Provider
      value={{
        sources: projectData?.sources,
        channelId: projectData?.channel.id,
        isLoading,
        updateSources,
      }}
    >
      {children}
    </SourcesContext.Provider>
  );
};

export default SourcesContainer;

export function useSources() {
  const context = useContext(SourcesContext);
  if (!context) {
    throw new Error('useSources must be used within a SourcesContainer');
  }
  return context;
}

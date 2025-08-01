import React, {PropsWithChildren, useCallback, useState, createContext, useContext} from 'react';

import type {MultiFileSource, ProjectSources} from '@lab2-base/types';

/**
 * Describes the current lab application we are viewing.
 */
export interface ProjectContent {
  /** The sources */
  source?: MultiFileSource;
  /** Updates the source without saving. */
  setSource: (source: MultiFileSource) => void,
  /** Updates the source and possibly triggers a save. */
  setAndSaveSource: (source: MultiFileSource, forceSave: boolean = false, forceNewVersion: boolean = false) => void;
  /** Resets the state that needs to be manually on level change. */
  resetProjectMetadata: () => void;
  /** Whether or not the project has been edited. */
  hasEdited: boolean;
  /** Updates the state of whether or not the project has been edited. */
  setHasEdited: (value: boolean) => void;
  /** The overall project sources */
  projectSources?: ProjectSources;
  /** Sets the project sources */
  setProjectSource: (sources: ProjectSources | undefined) => void;
  /** Triggers a load of the project sources. */
  loadSources: (versionId?: string) => ProjectSources | undefined;
  /** Whether or not we are viewing an old version */
  viewingOldVersion: boolean;
  /** Sets whether or not we are viewing an old version */
  setViewingOldVersion: (value: boolean) => void;
  /** Whether or not we have restored an old version */
  restoredOldVersion: boolean;
  /** Sets whether or not we have restored an old version */
  setRestoredOldVersion: (value: boolean) => void;
  /** Whether or not the project was too large. */
  projectTooLarge: boolean;
  /** Sets whether or not the project was too large. */
  setProjectTooLarge: (value: boolean) => void;
}

/**
 * The current lab project metadata.
 */
const ProjectContext = createContext<ProjectContent>({
  setSource: (_source: MultiFileSource) => {},
  setAndSaveSource: (_source: MultiFileSource, _forceSave: boolean = false, _forceNewVersion: boolean = false) => {},
  hasEdited: false,
  setHasEdited: (_value: boolean) => {},
  loadSources: (_versionId?: string) => {},
  viewingOldVersion: false,
  setViewingOldVersion: (_value: boolean) => {},
  setRestoredOldVersion: (_value: boolean) => {},
  restoredOldVersion: false,
  projectTooLarge: false,
});

/**
 * This hook returns the lab project metadata.
 */
export const useProject = () => useContext(ProjectContext);

/**
 * Holds the lab project and sources state.
 */
export const ProjectProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [hasEdited, setHasEdited] = useState<boolean>(false);
  const [source, setSource] = useState<MultiFileSource | undefined>(undefined);
  const [viewingOldVersion, setViewingOldVersion] = useState<boolean>(false);
  const [restoredOldVersion, setRestoredOldVersion] = useState<boolean>(false);
  const [projectTooLarge, setProjectTooLarge] = useState<boolean>(false);
  const [projectSources, setProjectSource] = useState<ProjectSources | undefined>(undefined);
  const save = useCallback((projectSources: ProjectSources | undefined, _forceSave: boolean = false, _forceNewVersion = false) => {
  }, []);

  const setAndSaveSource = useCallback((source: MultiFileSource, forceSave: boolean = false, forceNewVersion: boolean = false) => {
    setSource(source);
    save(undefined, forceSave, forceNewVersion);
  }, [setSource, save]);

  const setAndSaveProjectSources = useCallback((projectSources: ProjectSources, forceSave: boolean = false, forceNewVersion: boolean = false) => {
    setProjectSource(projectSources);
    save(undefined, forceSave, forceNewVersion);
  }, [setSource, save]);

  const flushSave = useMemo(() => (async () => {
  })(), []);

  const loadVersion = useCallback(({versionId, startSources}: {versionId: string, startSources: ProjectSources}) => (async () => {
    await flushSave();

    const sources =
      (await loadSources(versionId)) || startSources;

    setPreviousVersionSource(sources);
  })(), [flushSave]);

  const resetProjectMetadata = useCallback(() => {
  }, []);

  return (
    <ProjectContext.Provider value={{
      source,
      setSource,
      setAndSaveSource,
      resetProjectMetadata,
      hasEdited,
      setHasEdited,
      projectSources,
      setProjectSource,
      setAndSaveProjectSources,
      viewingOldVersion,
      setViewingOldVersion,
      restoredOldVersion,
      setRestoredOldVersion,
      projectTooLarge,
      setProjectTooLarge,
      loadVersion,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;

import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import ProjectManagerFactory from '@cdo/apps/labs/projects/ProjectManagerFactory';
import {ProjectManagerStorageType} from '@cdo/apps/labs/types';
import ProjectManager, {
  ProjectManagerEvent,
} from '@cdo/apps/labs/projects/ProjectManager';
import {ProjectManagerContext} from './ProjectManagerContext';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
} from '@cdo/apps/code-studio/projectRedux';

const ProjectContainer: React.FunctionComponent<ProjectContainerProps> = ({
  children,
  channelId,
}) => {
  const currentLevelId = useSelector(
    // TODO: Convert progress redux to typescript so this can be typed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => state.progress.currentLevelId
  );
  // TODO: Convert progress redux to typescript so this can be typed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scriptId = useSelector((state: any) => state.progress.scriptId);
  const [projectManager, setProjectManager] = useState<ProjectManager | null>(
    null
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    async function createProjectManager() {
      let newProjectManager;
      // If we have a channel id, create a project manager with that channel id.
      // Otherwise, create a project manager with the current level id and script.
      if (channelId) {
        newProjectManager = ProjectManagerFactory.getProjectManager(
          ProjectManagerStorageType.REMOTE,
          channelId
        );
      } else {
        newProjectManager =
          await ProjectManagerFactory.getProjectManagerForLevel(
            ProjectManagerStorageType.REMOTE,
            currentLevelId,
            scriptId
          );
      }
      // Only set the project manager if we have not changed levels since we started.
      if (active) {
        console.log('about to set project manager');
        setProjectManager(newProjectManager);
        newProjectManager.addEventListener(
          ProjectManagerEvent.SaveStart,
          () => {
            dispatch(setProjectUpdatedSaving());
          }
        );
      }
    }
    createProjectManager();
    // If this is called, it means another useEffect has been called in the meantime.
    // In this case, we no longer want to set the project manager that we were creating,
    // as a more up-to-date one will be created.
    return () => {
      active = false;
    };
  }, [channelId, currentLevelId, scriptId, dispatch]);

  const addSaveListeners = () => {
    if (projectManager) {
      projectManager.addEventListener(ProjectManagerEvent.SaveStart, () => {
        dispatch(setProjectUpdatedSaving());
      });
      projectManager.addEventListener(
        ProjectManagerEvent.SaveSuccess,
        status => {
          // TODO: figure out typing here
          //dispatch(setProjectUpdatedAt(status.updatedAt));
        }
      );
      projectManager.addEventListener(ProjectManagerEvent.SaveFail, () => {
        dispatch(setProjectUpdatedError());
      });
    }
  };
  console.log('in render, projectManager is ', projectManager);

  return (
    <ProjectManagerContext.Provider value={projectManager}>
      {children}
    </ProjectManagerContext.Provider>
  );
};

interface ProjectContainerProps {
  children: React.ReactNode;
  channelId?: string;
}

export default ProjectContainer;

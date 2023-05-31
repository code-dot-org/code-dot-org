import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import ProjectManagerFactory from '@cdo/apps/labs/projects/ProjectManagerFactory';
import {ProjectManagerStorageType} from '@cdo/apps/labs/types';
import LabRegistry from '../LabRegistry';
import {setUpForLevel} from '../labRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

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

  const dispatch = useAppDispatch();

  useEffect(() => {
    // If we have a channel id, create a project manager with that channel id.
    // Otherwise, dispatch an action which will create a
    // project manager for the current level id and script.
    if (channelId) {
      LabRegistry.getInstance().setProjectManager(
        ProjectManagerFactory.getProjectManager(
          ProjectManagerStorageType.REMOTE,
          channelId
        )
      );
    } else {
      const promise = dispatch(
        setUpForLevel({levelId: currentLevelId, scriptId})
      );
      return () => {
        promise.abort();
      };
    }
  }, [channelId, currentLevelId, scriptId, dispatch]);

  return <>{children}</>;
};

interface ProjectContainerProps {
  children: React.ReactNode;
  channelId?: string;
}

export default ProjectContainer;

import React, {useCallback, useEffect, useMemo} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import {getStandaloneProjectId} from '@cdo/apps/lab2/projects/utils';
import type {LabProps, ProjectSources} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import BuildlabView from './BuildlabView';
import {
  cloneBuildLabProject,
  DEFAULT_PROJECT,
  normalizeBuildLabProject,
  parseBuildLabProject,
  serializeBuildLabProject,
  type BuildLabProject,
} from './project';

const DEFAULT_SOURCES: ProjectSources = {
  source: serializeBuildLabProject(DEFAULT_PROJECT),
};

function projectFromSources(sources: ProjectSources): BuildLabProject {
  const source =
    typeof sources.source === 'string'
      ? sources.source
      : JSON.stringify(sources.source);
  return normalizeBuildLabProject(
    parseBuildLabProject(source) ?? cloneBuildLabProject(DEFAULT_PROJECT)
  );
}

const BuildlabContainer: React.FunctionComponent<LabProps> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const standaloneChannelId = getStandaloneProjectId();
  const {currentSources, updateSources, isEditable, channel, loadError} =
    useSources<ProjectSources>({
      defaultSources: DEFAULT_SOURCES,
      levelProperties,
      standaloneChannelId,
    });

  useEffect(() => {
    if (loadError) {
      dispatch(
        setPageError({
          errorMessage: 'Error loading Build Lab project',
          error: loadError,
        })
      );
    }
  }, [dispatch, loadError]);

  const project = useMemo(
    () => (currentSources ? projectFromSources(currentSources) : undefined),
    [currentSources]
  );
  const providedModels = useMemo(
    () =>
      levelProperties.aiModelId && levelProperties.aiModelName
        ? [
            {
              id: levelProperties.aiModelId,
              name: levelProperties.aiModelName,
            },
          ]
        : [],
    [levelProperties.aiModelId, levelProperties.aiModelName]
  );
  const handleProjectChange = useCallback(
    (nextProject: BuildLabProject) => {
      // Saves ride Lab2's 30-second interval. ProjectContainer force-saves any
      // pending change on beforeunload, so nothing is lost by not forcing here.
      updateSources({source: serializeBuildLabProject(nextProject)});
    },
    [updateSources]
  );

  if (!project) {
    return <Loading isLoading={true} />;
  }

  return (
    <BuildlabView
      channelId={channel?.id ?? standaloneChannelId}
      initialProject={project}
      onProjectChange={handleProjectChange}
      providedModels={providedModels}
      readOnly={!isEditable}
    />
  );
};

export default BuildlabContainer;

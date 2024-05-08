import {isEqual} from 'lodash';
import {useMemo, useEffect} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {setAndSaveProjectSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useInitialSources} from './useInitialSources';

export const useSource = (defaultSources: ProjectSources) => {
  const dispatch = useAppDispatch();
  const projectSource = useAppSelector(
    state => state.lab2Project.projectSource,
    isEqual
  );
  const source = projectSource?.source as MultiFileSource;
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const initialSources = useInitialSources(defaultSources);

  const setProject = useMemo(
    () => (newProject: MultiFileSource) => {
      dispatch(setAndSaveProjectSource({source: newProject}));
    },
    [dispatch]
  );

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        return {source};
      });
    }
  }, [isStartMode, source]);

  useEffect(() => {
    // We reset the project when the channelId changes, as this means we are on a new level.
    if (initialSources) {
      dispatch(
        setAndSaveProjectSource({
          source: initialSources.source as MultiFileSource,
        })
      );
    }
  }, [channelId, initialSources, dispatch]);

  return {source, setProject};
};

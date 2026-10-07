import React, {useEffect} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_SOURCES} from '../snapshotSources';
import {AilabLevelProperties, AilabProjectSources} from '../types';

import AilabView from './AilabView';

const AilabContainer: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const {currentSources, projectManager, loadError} =
    useSources<AilabProjectSources>({
      levelProperties,
      defaultSources: DEFAULT_SOURCES,
    });

  useEffect(() => {
    if (projectManager) {
      Lab2Registry.getInstance().setProjectManager(projectManager);
    }
    return () => Lab2Registry.getInstance().clearProjectManager();
  }, [projectManager]);

  useEffect(() => {
    if (loadError) {
      dispatch(
        setPageError({errorMessage: 'Error loading project', error: loadError})
      );
    }
  }, [loadError, dispatch]);

  if (levelProperties.usesProjects && !currentSources) {
    return <Loading isLoading={true} />;
  }
  return <AilabView levelProperties={levelProperties} />;
};

export default AilabContainer;

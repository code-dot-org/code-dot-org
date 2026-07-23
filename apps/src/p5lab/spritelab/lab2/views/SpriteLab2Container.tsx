import React, {useCallback, useEffect, useState} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import defaultSources from '../defaultSources.json';
import type {SpriteLab2LevelProperties, SpriteLab2Source} from '../types';

import SpriteLab2View from './SpriteLab2View';

const SpriteLab2Container: React.FunctionComponent<
  LabProps<SpriteLab2LevelProperties, SpriteLab2Source>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  const [sourcesReinitializedCount, setSourcesReinitializedCount] = useState(0);
  const handleReinitialize = useCallback(
    () => setSourcesReinitializedCount(c => c + 1),
    []
  );
  const {currentSources, channel, projectManager, loadError, ...restOutputs} =
    useSources<SpriteLab2Source>({
      levelProperties,
      defaultSources,
      onReinitialize: handleReinitialize,
    });

  // Set the project manager in the registry for external components that need it (e.g. header).
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

  if (!currentSources) {
    return <Loading isLoading={true} />;
  }
  return (
    <SpriteLab2View
      currentSources={currentSources}
      levelProperties={levelProperties}
      channelId={channel?.id}
      sourcesReinitializedCount={sourcesReinitializedCount}
      {...restOutputs}
    />
  );
};

export default SpriteLab2Container;

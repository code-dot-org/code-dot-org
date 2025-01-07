import React, {useEffect} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import skins from '@cdo/apps/maze/skins';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {appendSystemOutMessage} from '../redux/consoleRedux';

const NeighborhoodPreview: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const dispatch = useAppDispatch();
  useEffect(() => {
    console.log({levelProperties});
    if (!levelProperties) {
      return;
    }
    const neighborhood = new Neighborhood(
      message => dispatch(appendSystemOutMessage(message)),
      () => dispatch(appendSystemOutMessage('')),
      isRunning => dispatch(setIsRunning(isRunning)),
      '[PYTHONLAB]'
    );

    const neighborhoodSkin = skins.load(
      (path: string) => levelProperties.baseAssetUrl + path,
      'neighborhood'
    );

    neighborhood.afterInject(
      levelProperties,
      neighborhoodSkin,
      {skinId: 'neighborhood', level: levelProperties, skin: neighborhoodSkin},
      () => {},
      () => {},
      () => {},
      () => {}
    );

    // const visualizationDiv = $('#visualization');
    // if (visualizationDiv) {
    //   $('#visualization').css({
    //     'max-width': '400px',
    //     'max-height': '400px',
    //     height: 'inherit',
    //     width: 'inherit',
    //   });
    // }
  }, [dispatch, levelProperties]);

  return (
    <NeighborhoodVisualization
      fullIconPath={'/blockly/media/turtle/icons_white.png'}
      useProtectedDiv={false}
    />
  );
};

export default NeighborhoodPreview;

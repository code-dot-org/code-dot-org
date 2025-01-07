import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemOutMessage} from '@codebridge/redux/consoleRedux';
import React, {useEffect} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import skins from '@cdo/apps/maze/skins';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

const NeighborhoodPreview: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const dispatch = useAppDispatch();
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';

  useEffect(() => {
    if (!levelProperties) {
      return;
    }
    const neighborhood = new Neighborhood(
      message => dispatch(appendSystemOutMessage(message)),
      () => dispatch(appendSystemOutMessage('')),
      isRunning => dispatch(setIsRunning(isRunning)),
      '[PYTHON LAB]'
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

    // The vertical version of the mini app is a static size for now,
    // so we can hard-code the css. The horizontal version is resizable,
    // and the css is handled by WorkspaceAndOutput
    if (isVertical) {
      $('#visualization').css({
        'max-width': '400px',
        'max-height': '400px',
        height: '400px',
        width: '400px',
      });

      $('#svgMaze').css({
        transform: 'scale(0.5)',
        'transform-origin': '0 0',
        position: 'absolute',
      });
    }
  }, [dispatch, levelProperties, isVertical]);

  return (
    <NeighborhoodVisualization
      fullIconPath={'/blockly/media/turtle/icons_white.png'}
      useProtectedDiv={false}
    />
  );
};

export default NeighborhoodPreview;

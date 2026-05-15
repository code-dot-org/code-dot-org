import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import type {MiniApp} from '@code-dot-org/mini-app-base';
import {
  NEIGHBORHOOD_NAME,
  NeighborhoodInputsContext,
  type NeighborhoodInputs,
  type NeighborhoodMiniApp,
} from '@code-dot-org/neighborhood-mini-app';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import ControlButtons from '@codebridge/Console/ControlButtons';
import {DEFAULT_FOLDER_ID, MAZE_FILE_NAME} from '@codebridge/constants';
import {createMiniApp} from '@codebridge/miniAppRegistry';
import {findFile} from '@codebridge/utils';
import {IconButton as MuiIconButton} from '@mui/material';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import skins from '@cdo/apps/maze/skins';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_MINI_APP_SIZE} from '../Workspace/constants';
import {scaleMiniApp} from '../Workspace/outputHelpers';

import moduleStyles from './mini-app-preview.module.scss';

interface MiniAppPreviewProps {
  maximizeMiniApp: () => void;
  minimizeMiniApp: () => void;
  isMaximized: boolean;
  style?: React.CSSProperties;
  showMaximizeButton?: boolean;
  handleScaling?: boolean;
}

const tooltipProps: TooltipProps = {
  text: codebridgeI18n.resetPreview(),
  size: 'xs',
  direction: 'onLeft',
  tooltipId: 'reset-preview-tooltip',
};

const MiniAppPreview: React.FunctionComponent<MiniAppPreviewProps> = ({
  maximizeMiniApp,
  minimizeMiniApp,
  isMaximized,
  style,
  showMaximizeButton = true,
  handleScaling,
}) => {
  const {levelProperties} = useCodebridgeContext();
  const dispatch = useAppDispatch();
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const isRunning = useAppSelector(state => state.lab2System.isRunning);

  const miniAppName = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );
  const serializedMaze = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return findFile(source, MAZE_FILE_NAME, DEFAULT_FOLDER_ID)?.contents;
  });

  // The MiniApp instance is held in state (rather than just read from
  // the registry on each render) so renders are triggered when it
  // becomes available — the registry is mutable global state with no
  // React subscription.
  const [miniApp, setMiniApp] = useState<MiniApp | null>(null);

  useEffect(() => {
    setIsResetButtonDisabled(isRunning);
  }, [isRunning]);

  useEffect(() => {
    setIsResetButtonDisabled(true);
  }, [levelProperties.id]);

  // Construct the MiniApp once per level. Callbacks resolve the console
  // manager lazily because it may not exist at construction time.
  useEffect(() => {
    if (!miniAppName) {
      CodebridgeRegistry.getInstance().setMiniApp(null);
      setMiniApp(null);
      return;
    }
    const consoleManager = () =>
      CodebridgeRegistry.getInstance().getConsoleManager();
    const instance = createMiniApp(miniAppName, {
      onOutputMessage: msg => consoleManager()?.writeConsoleMessage(msg),
      onNewlineMessage: () => consoleManager()?.writeConsoleMessage(''),
      onPartialOutputMessage: msg => consoleManager()?.writePartialLine(msg),
      setIsRunning: running => dispatch(setIsRunning(running)),
    });
    CodebridgeRegistry.getInstance().setMiniApp(instance);
    setMiniApp(instance);
    return () => {
      CodebridgeRegistry.getInstance().setMiniApp(null);
    };
  }, [miniAppName, dispatch]);

  // Neighborhood skin loading lives here because `@cdo/apps/maze/skins`
  // is apps-only. The package's preview consumes the loaded skin
  // through the inputs context.
  const neighborhoodSkin = useMemo(() => {
    if (miniAppName !== NEIGHBORHOOD_NAME || !levelProperties) {
      return null;
    }
    return skins.load(
      (path: string) => levelProperties.baseAssetUrl + path,
      NEIGHBORHOOD_NAME
    );
  }, [miniAppName, levelProperties]);

  // Window-resize scaling. The container ref points at the wrapper
  // around the rendered preview; on resize we recompute the scale and
  // apply it through the shared apps-side helper.
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleForWindowResize = useCallback(() => {
    const width = containerRef.current?.clientWidth || DEFAULT_MINI_APP_SIZE;
    const height = containerRef.current?.clientHeight || DEFAULT_MINI_APP_SIZE;
    scaleMiniApp(height, width);
  }, []);
  const throttledScale = useMemo(
    () => throttle(scaleForWindowResize, 30),
    [scaleForWindowResize]
  );
  useEffect(() => {
    if (!handleScaling || !miniApp) return;
    throttledScale();
    window.addEventListener('resize', throttledScale);
    return () => window.removeEventListener('resize', throttledScale);
  }, [throttledScale, handleScaling, miniApp]);

  const neighborhoodInputs = useMemo<NeighborhoodInputs | null>(() => {
    if (miniAppName !== NEIGHBORHOOD_NAME) return null;
    return {
      miniApp: miniApp as NeighborhoodMiniApp | null,
      levelProperties,
      skin: neighborhoodSkin,
      serializedMaze,
    };
  }, [miniAppName, miniApp, levelProperties, neighborhoodSkin, serializedMaze]);

  const miniAppComponent = useMemo(() => {
    const PreviewComponent = miniApp?.PreviewComponent;
    if (!PreviewComponent) return null;
    const rendered = (
      <div ref={containerRef} className={moduleStyles.miniAppContainer}>
        <PreviewComponent handleScaling={handleScaling} />
      </div>
    );
    if (neighborhoodInputs) {
      return (
        <NeighborhoodInputsContext.Provider value={neighborhoodInputs}>
          {rendered}
        </NeighborhoodInputsContext.Provider>
      );
    }
    return rendered;
  }, [miniApp, handleScaling, neighborhoodInputs]);

  const resetMiniApp = () => {
    setIsResetButtonDisabled(true);
    CodebridgeRegistry.getInstance().getMiniApp()?.reset();
  };

  return (
    <PanelContainer
      id="codebridge-preview"
      headerContent={codebridgeI18n.preview()}
      leftHeaderContent={<ControlButtons />}
      className={moduleStyles.previewContainer}
      headerClassName={moduleStyles.previewHeader}
      rightHeaderContent={
        <>
          <WithTooltip tooltipProps={tooltipProps}>
            <MuiIconButton
              variant="text"
              color="primary"
              size="extraSmall"
              disabled={isResetButtonDisabled}
              onClick={resetMiniApp}
              aria-label={codebridgeI18n.resetPreview()}
              type="button"
            >
              <FontAwesomeV6Icon iconStyle="solid" iconName="rotate-left" />
            </MuiIconButton>
          </WithTooltip>
          {showMaximizeButton && (
            <MuiIconButton
              variant="text"
              color="primary"
              size="extraSmall"
              onClick={isMaximized ? minimizeMiniApp : maximizeMiniApp}
              aria-label={
                isMaximized
                  ? codebridgeI18n.minimizePreview()
                  : codebridgeI18n.maximizePreview()
              }
              type="button"
            >
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName={isMaximized ? 'compress' : 'expand'}
              />
            </MuiIconButton>
          )}
        </>
      }
    >
      <div style={style} className={moduleStyles.miniAppContainer}>
        {miniAppComponent}
      </div>
    </PanelContainer>
  );
};

export default MiniAppPreview;

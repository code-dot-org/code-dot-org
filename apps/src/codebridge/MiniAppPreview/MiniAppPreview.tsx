import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import type {MiniApp} from '@code-dot-org/mini-app-base';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import ControlButtons from '@codebridge/Console/ControlButtons';
import {createMiniApp, getMiniAppAdapter} from '@codebridge/miniAppRegistry';
import {IconButton as MuiIconButton} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './mini-app-preview.module.scss';

interface MiniAppPreviewProps {
  maximizeMiniApp: () => void;
  minimizeMiniApp: () => void;
  isMaximized: boolean;
  style?: React.CSSProperties;
  showMaximizeButton?: boolean;
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
}) => {
  const {levelProperties} = useCodebridgeContext();
  const dispatch = useAppDispatch();
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const isRunning = useAppSelector(state => state.lab2System.isRunning);

  const miniAppName = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );

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

  const miniAppComponent = useMemo(() => {
    const PreviewComponent = miniApp?.PreviewComponent;
    if (!PreviewComponent || !miniAppName) return null;
    const rendered = (
      <div className={moduleStyles.miniAppContainer}>
        <PreviewComponent />
      </div>
    );
    const Adapter = getMiniAppAdapter(miniAppName);
    if (Adapter && miniApp) {
      return <Adapter miniApp={miniApp}>{rendered}</Adapter>;
    }
    return rendered;
  }, [miniApp, miniAppName]);

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

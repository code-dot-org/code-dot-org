import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import ControlButtons from '@codebridge/Console/ControlButtons';
import {MiniApps} from '@codebridge/constants';
import {IconButton as MuiIconButton} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import NeighborhoodPreview from './NeighborhoodPreview';

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
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const isRunning = useAppSelector(state => state.lab2System.isRunning);

  useEffect(() => {
    setIsResetButtonDisabled(isRunning);
  }, [isRunning]);

  useEffect(() => {
    setIsResetButtonDisabled(true);
  }, [levelProperties.id]);

  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );

  const miniAppComponent = useMemo(() => {
    if (miniApp === MiniApps.Neighborhood) {
      return <NeighborhoodPreview handleScaling={handleScaling} />;
    }
    return null;
  }, [handleScaling, miniApp]);

  const resetMiniApp = () => {
    setIsResetButtonDisabled(true);
    if (miniApp === MiniApps.Neighborhood) {
      CodebridgeRegistry.getInstance().getNeighborhood()?.reset();
    }
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

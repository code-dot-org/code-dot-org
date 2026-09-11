import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import ControlButtons from '@codebridge/Console/ControlButtons';
import {MiniApps} from '@codebridge/constants';
import {IconButton as MuiIconButton, Tooltip} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import NeighborhoodPreview from './NeighborhoodPreview';
import TheaterPreview from './TheaterPreview';

import moduleStyles from './mini-app-preview.module.scss';

interface MiniAppPreviewProps {
  maximizeMiniApp: () => void;
  minimizeMiniApp: () => void;
  isMaximized: boolean;
  style?: React.CSSProperties;
  showMaximizeButton?: boolean;
  handleScaling?: boolean;
}

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
  const [isTheaterOutputVisible, setIsTheaterOutputVisible] = useState(false);
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

  const {miniAppComponent, miniAppTitle} = useMemo(() => {
    if (miniApp === MiniApps.Neighborhood) {
      return {
        miniAppComponent: <NeighborhoodPreview handleScaling={handleScaling} />,
        miniAppTitle: 'Neighborhood',
      };
    }
    if (miniApp === MiniApps.Theater) {
      return {
        miniAppComponent: (
          <TheaterPreview
            isOutputVisible={isTheaterOutputVisible}
            setIsOutputVisible={setIsTheaterOutputVisible}
          />
        ),
        miniAppTitle: 'Theater',
      };
    }
    return {miniAppComponent: null, miniAppTitle: codebridgeI18n.preview()};
  }, [handleScaling, miniApp, isTheaterOutputVisible]);

  // Stopping clears the theater's stage, so there is nothing left to reset.
  const isResetDisabled =
    isResetButtonDisabled ||
    (miniApp === MiniApps.Theater && !isTheaterOutputVisible);

  const resetMiniApp = () => {
    setIsResetButtonDisabled(true);
    if (miniApp === MiniApps.Neighborhood) {
      CodebridgeRegistry.getInstance().getNeighborhood()?.reset();
    }
    if (miniApp === MiniApps.Theater) {
      CodebridgeRegistry.getInstance().getTheater()?.reset();
    }
  };

  return (
    <PanelContainer
      id="codebridge-preview"
      headerContent={miniAppTitle}
      leftHeaderContent={<ControlButtons />}
      className={moduleStyles.previewContainer}
      headerClassName={moduleStyles.previewHeader}
      rightHeaderContent={
        <>
          <Tooltip placement="left" title={codebridgeI18n.resetPreview()}>
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="extraSmall"
              disabled={isResetDisabled}
              onClick={resetMiniApp}
              aria-label={codebridgeI18n.resetPreview()}
              type="button"
            >
              <FontAwesomeV6Icon iconStyle="solid" iconName="rotate-left" />
            </MuiIconButton>
          </Tooltip>
          {showMaximizeButton && (
            <MuiIconButton
              variant="text"
              color="tertiary"
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

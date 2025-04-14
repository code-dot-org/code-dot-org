import Button from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ControlButtons from '@codebridge/Console/ControlButtons';
import {MiniApps} from '@codebridge/constants';
import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import NeighborhoodPreview from './NeighborhoodPreview';

import moduleStyles from './mini-app-preview.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface MiniAppPreviewProps {
  maximizeMiniApp: () => void;
  minimizeMiniApp: () => void;
  resetMiniApp: () => void;
  isMaximized: boolean;
  style?: React.CSSProperties;
  showMaximizeButton?: boolean;
  handleScaling?: boolean;
}

const MiniAppPreview: React.FunctionComponent<MiniAppPreviewProps> = ({
  maximizeMiniApp,
  minimizeMiniApp,
  resetMiniApp,
  isMaximized,
  style,
  showMaximizeButton = true,
  handleScaling,
}) => {
  const {labConfig} = useCodebridgeContext();

  const miniApp = labConfig?.miniApp?.name;

  const miniAppComponent =
    miniApp === MiniApps.Neighborhood ? (
      <NeighborhoodPreview handleScaling={handleScaling} />
    ) : null;

  const tooltipProps: TooltipProps = {
    text: codebridgeI18n.resetPreview(),
    size: 'xs',
    direction: 'onLeft',
    tooltipId: 'reset-preview-tooltip',
    className: darkModeStyles.tooltipLeft,
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
            <Button
              onClick={resetMiniApp}
              icon={{
                iconStyle: 'solid',
                iconName: 'rotate-right',
              }}
              size={'xs'}
              type={'tertiary'}
              className={classNames(darkModeStyles.tertiaryButton)}
              isIconOnly={true}
              ariaLabel={codebridgeI18n.resetPreview()}
            />
          </WithTooltip>
          {showMaximizeButton && (
            <Button
              onClick={isMaximized ? minimizeMiniApp : maximizeMiniApp}
              icon={{
                iconStyle: 'solid',
                iconName: isMaximized ? 'compress' : 'expand',
              }}
              size={'xs'}
              type={'tertiary'}
              className={classNames(darkModeStyles.tertiaryButton)}
              isIconOnly={true}
              ariaLabel={
                isMaximized
                  ? codebridgeI18n.minimizePreview()
                  : codebridgeI18n.maximizePreview()
              }
            />
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

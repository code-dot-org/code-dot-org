import Button from '@code-dot-org/component-library/button';
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
  isMaximized: boolean;
  style?: React.CSSProperties;
}

const MiniAppPreview: React.FunctionComponent<MiniAppPreviewProps> = ({
  maximizeMiniApp,
  minimizeMiniApp,
  isMaximized,
  style,
}) => {
  const {labConfig} = useCodebridgeContext();

  const miniApp = labConfig?.miniApp?.name;

  const miniAppComponent =
    miniApp === MiniApps.Neighborhood ? <NeighborhoodPreview /> : null;

  return (
    <PanelContainer
      id="codebridge-preview"
      headerContent={codebridgeI18n.preview()}
      leftHeaderContent={<ControlButtons />}
      className={moduleStyles.previewContainer}
      headerClassName={moduleStyles.previewHeader}
      rightHeaderContent={
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
          color={'white'}
          ariaLabel={
            isMaximized
              ? codebridgeI18n.minimizePreview()
              : codebridgeI18n.maximizePreview()
          }
        />
      }
    >
      <div style={style}>{miniAppComponent}</div>
    </PanelContainer>
  );
};

export default MiniAppPreview;

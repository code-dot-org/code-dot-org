import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button from '@cdo/apps/componentLibrary/button';
import {TooltipProps} from '@cdo/apps/componentLibrary/tooltip';
import WithTooltip from '@cdo/apps/componentLibrary/tooltip/WithTooltip';

import {useCodebridgeContext} from '../codebridgeContext';

import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

/*
  This component will look to the `showFileBrowser` boolean in the config and flip it back and forth.
  If we're showing it, the icon is solid, and if not, the icon is regular.

  If no `showFileBrowser` boolean is provided in the config, then this button will not render.

*/

const ToggleFileBrowserButton: React.FunctionComponent = () => {
  const {config, setConfig} = useCodebridgeContext();

  const onClick = useCallback(
    () =>
      setConfig({
        ...config,
        showFileBrowser: !config.showFileBrowser,
      }),
    [config, setConfig]
  );

  const tooltipProps: TooltipProps = {
    text: codebridgeI18n.toggleFileBrowser(),
    direction: 'onRight',
    tooltipId: 'toggle-file-browser-tooltip',
    size: 'xs',
    className: darkModeStyles.tooltipRight,
  };

  return (
    <span>
      <WithTooltip tooltipProps={tooltipProps}>
        <Button
          icon={{
            iconStyle: config.showFileBrowser ? 'solid' : 'regular',
            iconName: 'folder',
          }}
          isIconOnly
          color={'white'}
          onClick={onClick}
          ariaLabel={codebridgeI18n.toggleFileBrowser()}
          size={'xs'}
          type={'tertiary'}
          className={darkModeStyles.iconOnlyTertiaryButton}
        />
      </WithTooltip>
    </span>
  );
};

export default ToggleFileBrowserButton;

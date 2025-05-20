import Button from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {useCodebridgeContext} from '../codebridgeContext';

/*
  This component will look to the `showFileBrowser` boolean in the config and flip it back and forth.
  If we're showing it, the icon is solid, and if not, the icon is regular.
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
          onClick={onClick}
          ariaLabel={codebridgeI18n.toggleFileBrowser()}
          size={'xs'}
          type={'tertiary'}
          aria-expanded={config.showFileBrowser}
          color={'black'}
        />
      </WithTooltip>
    </span>
  );
};

export default ToggleFileBrowserButton;

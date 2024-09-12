import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button from '@cdo/apps/componentLibrary/button';

import {useCodebridgeContext} from './codebridgeContext';

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

  if (config.showFileBrowser === undefined) {
    return null;
  }

  return (
    <span>
      <Button
        icon={{
          iconStyle: config.showFileBrowser ? 'solid' : 'regular',
          iconName: 'folder',
        }}
        isIconOnly
        color={'black'}
        onClick={onClick}
        ariaLabel={codebridgeI18n.toggleFileBrowser()}
        size={'xs'}
      />
    </span>
  );
};

export default ToggleFileBrowserButton;

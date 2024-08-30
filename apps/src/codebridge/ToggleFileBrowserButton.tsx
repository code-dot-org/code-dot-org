import React, {useCallback} from 'react';

import Button from '@cdo/apps/componentLibrary/button';

import {useCodebridgeContext} from './codebridgeContext';

/*
  Please note - this is a fairly brittle component in that it's only allowing toggling between
  horizontal and vertical layouts. That's...kinda fine? For now? Probably?

  At some point in the future, we may need to expand the functionality to select between arbitrary
  layouts which are available - we'll probably want to iterate through the keys of the labeledGridLayouts
  and have each of them provide an icon (to add to the button) and a nextState (to show which layout to toggle to)
  or alternatively, maybe this whole component should become a pop up list to let the user select it? Maybe this one
  stays around as the easy way to flip between just horizontal and vertical?

  Anyway, again, it's fine as is, but will require refactoring if we expand use cases.
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
    <Button
      icon={{
        iconStyle: config.showFileBrowser ? 'solid' : 'regular',
        iconName: 'folder',
      }}
      isIconOnly
      color={'black'}
      onClick={onClick}
      ariaLabel={'toggle file browser'}
      size={'xs'}
    />
  );
};

export default ToggleFileBrowserButton;

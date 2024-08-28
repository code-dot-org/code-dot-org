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

const SwapLayoutButton: React.FunctionComponent = () => {
  const {config, setConfig} = useCodebridgeContext();

  const iconName =
    config.activeGridLayout === 'horizontal' ? 'table-columns' : 'table-rows';

  const onClick = useCallback(
    () =>
      setConfig({
        ...config,
        activeGridLayout:
          config.activeGridLayout === 'horizontal' ? 'vertical' : 'horizontal',
      }),
    [config, setConfig]
  );

  if (!config.activeGridLayout || !config.labeledGridLayouts) {
    return null;
  }

  return (
    <Button
      icon={{iconStyle: 'solid', iconName}}
      isIconOnly
      color={'black'}
      onClick={onClick}
      ariaLabel={'change layout'}
      size={'xs'}
    />
  );
};

export default SwapLayoutButton;

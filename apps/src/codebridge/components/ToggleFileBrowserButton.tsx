import Button from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {setShowFileBrowser} from '../redux/workspaceRedux';

/*
  This component will look to the `showFileBrowser` boolean in redux and flip it back and forth.
  If we're showing it, the icon is solid, and if not, the icon is regular.
*/

const ToggleFileBrowserButton: React.FunctionComponent = () => {
  const showFileBrowser = useAppSelector(
    state => state.codebridgeWorkspace.showFileBrowser
  );
  const dispatch = useAppDispatch();

  const onClick = useCallback(
    () => dispatch(setShowFileBrowser(!showFileBrowser)),
    [showFileBrowser, dispatch]
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
            iconStyle: showFileBrowser ? 'solid' : 'regular',
            iconName: 'folder',
          }}
          isIconOnly
          onClick={onClick}
          ariaLabel={codebridgeI18n.toggleFileBrowser()}
          size={'xs'}
          type={'tertiary'}
          aria-expanded={showFileBrowser}
          color={'black'}
        />
      </WithTooltip>
    </span>
  );
};

export default ToggleFileBrowserButton;

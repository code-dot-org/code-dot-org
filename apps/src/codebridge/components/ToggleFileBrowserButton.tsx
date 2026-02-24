import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
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

  const tooltipText = showFileBrowser
    ? codebridgeI18n.closeFileManager()
    : codebridgeI18n.openFileManager();

  return (
    <IconButtonWithTooltip
      id="toggle-file-manager"
      label={tooltipText}
      icon={{
        iconName: showFileBrowser ? 'arrow-left-to-line' : 'folder',
        iconStyle: 'solid',
      }}
      type={showFileBrowser ? 'tertiary' : 'secondary'}
      color="gray"
      buttonSize="xs"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={false}
      onClick={onClick}
      aria-expanded={showFileBrowser}
    />
  );
};

export default ToggleFileBrowserButton;

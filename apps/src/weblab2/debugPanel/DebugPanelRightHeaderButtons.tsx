import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Tooltip} from '@mui/material';
import React, {useMemo} from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {clearConsoleLogs} from '@cdo/apps/weblab2/redux/consoleRedux';
import {clearRequests} from '@cdo/apps/weblab2/redux/networkRedux';
import {setDebugPanelOpen} from '@cdo/apps/weblab2/weblab2Redux';

import moduleStyles from './debug-panel-right-header-buttons.module.scss';

interface DebugPanelRightHeaderButtonsProps {
  selectedPanel: 'console' | 'network';
}

const DebugPanelRightHeaderButtons: React.FunctionComponent<
  DebugPanelRightHeaderButtonsProps
> = ({selectedPanel}) => {
  const dispatch = useAppDispatch();
  const handleClear = () => {
    if (selectedPanel === 'console') {
      dispatch(clearConsoleLogs());
    } else {
      dispatch(clearRequests());
    }
  };

  const label = useMemo(() => {
    return selectedPanel === 'console'
      ? 'Clear console logs'
      : 'Clear network requests';
  }, [selectedPanel]);

  return (
    <div className={moduleStyles.buttonContainer}>
      <Tooltip placement="bottom" title={label}>
        <MuiIconButton
          variant="outlined"
          color="tertiary"
          size="extraSmall"
          onClick={handleClear}
          aria-label={label}
          type="button"
        >
          <FontAwesomeV6Icon iconName="eraser" />
        </MuiIconButton>
      </Tooltip>
      <CloseButton
        onClick={() => dispatch(setDebugPanelOpen(false))}
        aria-label="Close debug panel"
      />
    </div>
  );
};

export default DebugPanelRightHeaderButtons;

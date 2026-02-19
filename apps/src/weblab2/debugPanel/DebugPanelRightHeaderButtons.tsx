import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
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
      <WithTooltip
        tooltipProps={{
          text: label,
          direction: 'onBottom',
          tooltipId: 'clear-debug-tooltip',
          size: 'xs',
        }}
      >
        <Button
          isIconOnly={true}
          icon={{iconName: 'eraser'}}
          onClick={handleClear}
          aria-label={label}
          size={'xs'}
          type={'secondary'}
          color={'gray'}
        />
      </WithTooltip>
      <CloseButton
        onClick={() => dispatch(setDebugPanelOpen(false))}
        aria-label="Close debug panel"
      />
    </div>
  );
};

export default DebugPanelRightHeaderButtons;

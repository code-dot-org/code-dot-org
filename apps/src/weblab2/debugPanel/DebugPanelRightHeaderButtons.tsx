import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {clearRequests} from '@cdo/apps/weblab2/redux/networkRedux';
import {setDebugPanelOpen} from '@cdo/apps/weblab2/weblab2Redux';

import moduleStyles from './debug-panel-right-header-buttons.module.scss';

const DebugPanelRightHeaderButtons = () => {
  const dispatch = useAppDispatch();
  const handleClear = () => {
    dispatch(clearRequests());
  };

  return (
    <div className={moduleStyles.buttonContainer}>
      <WithTooltip
        tooltipProps={{
          text: 'Clear network requests',
          direction: 'onBottom',
          tooltipId: 'clear-debug-tooltip',
          size: 'xs',
        }}
      >
        <Button
          isIconOnly={true}
          icon={{iconName: 'eraser'}}
          onClick={handleClear}
          aria-label="Clear network requests"
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

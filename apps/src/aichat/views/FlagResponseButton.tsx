import Button from '@code-dot-org/component-library/button';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import React, {useState} from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import style from './flag-response-button.module.scss';

const FlagResponseButton: React.FC = ({}) => {
  const [showInput, setShowInput] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const dispatch = useAppDispatch();

  const state = useAppSelector(state => state);

  console.log('current state:', state);

  return (
    <div className={style.flagWrapper}>
      <WithTooltip
        tooltipProps={{
          tooltipId: 'internal-flag-tooltip',
          direction: 'onLeft',
          size: 'xs',
          text: 'Is something notable about this AI response? Log to Langfuse for review.',
          className: style.tooltip,
        }}
      >
        <Button
          onClick={() => {
            setShowInput(!showInput);
          }}
          color="gray"
          size="xs"
          isIconOnly
          icon={{
            iconStyle: 'solid',
            iconName: 'magnifying-glass-chart',
          }}
          type="tertiary"
        />
      </WithTooltip>
      {showInput && (
        <>
          <input
            className={style.flagInput}
            value={flagReason}
            placeholder="Reason"
            onChange={event => setFlagReason(event.target.value)}
          />
          <Button
            onClick={() => {
              setFlagReason('');
              console.log('save flag to langfuse dataset!');
            }}
            color="purple"
            size="xs"
            type="primary"
            text="save"
          />
        </>
      )}
    </div>
  );
};

export default FlagResponseButton;

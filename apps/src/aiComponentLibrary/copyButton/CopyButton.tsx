import Button from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {useState} from 'react';

import {sendAnalytics} from '@cdo/apps/aichat/redux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import style from './copy-button.module.scss';

const CONFIRM_TIMEOUT_MS = 1500;

const CopyButton: React.FC<{copyText: string; usage: string}> = ({
  copyText,
  usage,
}) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  /**
   * Get the theme, if available.  If not within a `ThemeProvider`, theme will be `undefined`
   *  which will then be ignored by `Tooltip`.
   **/
  const {theme} = useTheme(true);

  const dispatch = useAppDispatch();

  return (
    <WithTooltip
      tooltipProps={{
        tooltipId: 'copy-tooltip',
        direction: 'onRight',
        size: 'xs',
        text: showCopyConfirmation ? i18n.copied() : i18n.copy(),
        className: style.tooltip,
        iconLeft: showCopyConfirmation ? {iconName: 'check'} : undefined,
        'data-theme': theme,
      }}
    >
      <Button
        onClick={() => {
          copyToClipboard(copyText);
          setShowCopyConfirmation(true);
          setTimeout(() => setShowCopyConfirmation(false), CONFIRM_TIMEOUT_MS);
          dispatch(sendAnalytics(EVENTS.CHAT_COPIED, {usage: usage}));
        }}
        color="gray"
        size="xs"
        isIconOnly
        icon={{
          iconStyle: 'solid',
          iconName: 'copy',
        }}
        type="tertiary"
      />
    </WithTooltip>
  );
};

export default CopyButton;

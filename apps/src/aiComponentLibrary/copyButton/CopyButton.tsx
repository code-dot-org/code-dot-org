import Button from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {useState} from 'react';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import i18n from '@cdo/locale';

import style from './copy-button.module.scss';
import {sendAnalytics} from '@cdo/apps/aichat/redux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

const CONFIRM_TIMEOUT_MS = 1500;

const CopyButton: React.FC<{
  copyText: string;
}> = ({copyText}) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
  const clientType = useAppSelector(state => state.aichat.clientType);
  console.log('clientType', clientType);
  const analyticsEvent =
    clientType === AiChatClientTypes.AI_TUTOR
      ? EVENTS.COPY_AI_TUTOR_RESPONSE
      : undefined;
  console.log('analyticsEvent', analyticsEvent);

  /**
   * Get the theme, if available.  If not within a `ThemeProvider`, theme will be `undefined`
   *  which will then be ignored by `Tooltip`.
   **/
  const {theme} = useTheme(true);

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
          // if (!!analyticsEvent) {
          //   console.log('should send analytics', analyticsEvent, copyText);
          //   sendAnalytics(analyticsEvent, {copyText});
          // }
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

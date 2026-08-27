import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Tooltip} from '@mui/material';
import React, {useState} from 'react';

import {sendAnalytics} from '@cdo/apps/aichat/redux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

const CONFIRM_TIMEOUT_MS = 1500;

const CopyButton: React.FC<{copyText: string; usage: string}> = ({
  copyText,
  usage,
}) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  // Theme, if any. Outside a ThemeProvider it's undefined and the tooltip's
  // data-theme slot prop is simply omitted.
  const {theme} = useTheme(true);

  const dispatch = useAppDispatch();

  return (
    <Tooltip
      placement="right"
      title={
        <>
          {showCopyConfirmation && <FontAwesomeV6Icon iconName="check" />}
          {showCopyConfirmation ? i18n.copied() : i18n.copy()}
        </>
      }
      slotProps={theme ? {tooltip: {'data-theme': theme}} : undefined}
    >
      <MuiIconButton
        variant="text"
        color="tertiary"
        size="extraSmall"
        aria-label={i18n.copy()}
        onClick={() => {
          copyToClipboard(copyText);
          setShowCopyConfirmation(true);
          setTimeout(() => setShowCopyConfirmation(false), CONFIRM_TIMEOUT_MS);
          dispatch(sendAnalytics(EVENTS.CHAT_COPIED, {usage: usage}));
        }}
        type="button"
      >
        <FontAwesomeV6Icon iconStyle="solid" iconName="copy" />
      </MuiIconButton>
    </Tooltip>
  );
};

export default CopyButton;

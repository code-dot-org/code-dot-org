import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectType} from '@cdo/apps/lab2/types';
import CopiedTooltip from '@cdo/apps/sharedComponents/CopiedTooltip';
import {commonI18n as i18n} from '@cdo/apps/types/locale';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import trackEvent from '@cdo/apps/util/trackEvent';

import moduleStyles from './share-dialog.module.scss';

export const CopyToClipboardButton: React.FunctionComponent<{
  shareUrl: string;
  projectType: ProjectType;
}> = ({shareUrl, projectType}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard(shareUrl, () => {
      setCopiedToClipboard(true);
    });
    trackEvent('share', 'share_copy_url', {value: projectType});
  }, [shareUrl, projectType]);

  const clearCopiedToClipboard = useCallback(
    () => setCopiedToClipboard(false),
    []
  );

  // The tooltip portals to document.body, outside the dialog's `data-theme`
  // subtree, so hand it the lab theme the same way ShareDialog does.
  const theme = Lab2Registry.getInstance().getTheme();

  return (
    <CopiedTooltip
      copied={copiedToClipboard}
      onHide={clearCopiedToClipboard}
      // Below the button: above it is the QR code, and an inverted (white)
      // bubble laid over the QR's white quiet zone loses its own edge.
      placement="bottom"
      dataTheme={theme}
    >
      <MuiButton
        variant="outlined"
        color="secondary"
        size="medium"
        className={moduleStyles.shareDialogButton}
        onClick={handleCopyToClipboard}
        aria-label={i18n.copyLinkToProject()}
        type="button"
        startIcon={
          <FontAwesomeV6Icon
            iconName={copiedToClipboard ? 'clipboard-check' : 'clipboard'}
          />
        }
      >
        {i18n.copyLinkToProject()}
      </MuiButton>
    </CopiedTooltip>
  );
};

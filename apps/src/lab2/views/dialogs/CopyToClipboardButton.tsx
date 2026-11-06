import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
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
  /** The button's text, "Copy link to project" by default. */
  label?: string;
  className?: string;
  /** The icon before the text until the link is copied. */
  iconName?: string;
}> = ({
  shareUrl,
  projectType,
  label = i18n.copyLinkToProject(),
  className,
  iconName = 'clipboard',
}) => {
  const [copiedAt, setCopiedAt] = useState<number | null>(null);

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard(
      shareUrl,
      () => setCopiedAt(Date.now()),
      () => console.error('Error copying share link to clipboard')
    );
    trackEvent('share', 'share_copy_url', {value: projectType});
  }, [shareUrl, projectType]);

  const clearCopiedAt = useCallback(() => setCopiedAt(null), []);

  const theme = Lab2Registry.getInstance().getTheme();

  return (
    <CopiedTooltip
      copiedAt={copiedAt}
      onHide={clearCopiedAt}
      // Above the button is the QR code, whose white quiet zone swallows the
      // inverted bubble's edge.
      placement="bottom"
      dataTheme={theme}
    >
      <MuiButton
        variant="outlined"
        color="secondary"
        size="medium"
        className={classNames(moduleStyles.shareDialogButton, className)}
        onClick={handleCopyToClipboard}
        type="button"
        startIcon={
          <FontAwesomeV6Icon
            iconName={copiedAt ? 'clipboard-check' : iconName}
          />
        }
      >
        {label}
      </MuiButton>
    </CopiedTooltip>
  );
};

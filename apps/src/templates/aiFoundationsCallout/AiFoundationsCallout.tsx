import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import DCDO from '@cdo/apps/dcdo';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

const AI_FOUNDATIONS_URL =
  'https://code.org/en-US/curriculum/artificial-intelligence-foundations';

const AI_MAKERSPACE_UNIT = 'ai-makerspace1-2026';

export const shouldShowAiFoundationsCallout = (
  unitName: string | null | undefined
): boolean =>
  unitName === AI_MAKERSPACE_UNIT &&
  !!DCDO.get('hoai2026-aif-callout-enabled', true);

interface AiFoundationsCalloutProps {
  page: 'unitOverview' | 'studentSnapshot';
  unitName: string | null | undefined;
  className?: string;
}

const AiFoundationsCallout: React.FC<AiFoundationsCalloutProps> = ({
  page,
  unitName,
  className,
}) => {
  const storageKey = `aiFoundationsCalloutDismissed-${page}`;
  const [dismissed, setDismissed] = useState(
    () => tryGetLocalStorage(storageKey, '') === 'true'
  );

  if (dismissed || !shouldShowAiFoundationsCallout(unitName)) {
    return null;
  }

  const handleClose = () => {
    trySetLocalStorage(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <NotificationBanner
      className={className}
      variant="primary"
      style="subtle"
      icon={{iconName: 'laptop-code', iconStyle: 'solid'}}
      title="Ready for more?"
      description="If your students enjoyed AI Makerspace, AI Foundations takes them further. They'll learn how to code, think critically about AI, and use technology to solve real-world problems."
      actions={
        <MuiButton
          href={AI_FOUNDATIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          size="small"
        >
          Explore AI Foundations
        </MuiButton>
      }
      onClose={handleClose}
    />
  );
};

export default AiFoundationsCallout;

import {Button, IconButton} from '@mui/material';
import type {MouseEvent} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {localization} from '@code-dot-org/core/plugins/localization';

import type {ShareTarget} from '@/api/viewer';

import {useSocialShareAvailability} from './socialShareAvailability';
import styles from './socialShareButtons.module.css';

export interface SocialShareButtonsProps {
  allowedShareTargets: readonly ShareTarget[];
  isProfessionalLearning: boolean;
  /** Print in place when set; otherwise link out via printHref. */
  onPrint?: () => void;
  printHref?: string;
  /** Absolute URL of the certificate share page. */
  shareUrl: string;
}

/**
 * Social share-link buttons with legacy query semantics (SocialShare.jsx):
 * Facebook `u`, Twitter `url` + `related=codeorg` + text, LinkedIn `url`
 * (PL courses only). Server-derived capabilities control visibility.
 */
export function SocialShareButtons({
  allowedShareTargets,
  isProfessionalLearning,
  onPrint,
  printHref,
  shareUrl,
}: SocialShareButtonsProps) {
  const facebookAvailable = useSocialShareAvailability(
    'https://facebook.com/favicon.ico',
  );
  const twitterAvailable = useSocialShareAvailability(
    'https://x.com/favicon.ico',
  );
  const linkedinAvailable = useSocialShareAvailability(
    'https://www.linkedin.com/favicon.ico',
  );

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams(
    {u: shareUrl},
  )}`;
  const twitterShareUrl = `https://twitter.com/share?${new URLSearchParams({
    related: 'codeorg',
    text: localization.translate(
      'I just did the #HourOfCode - check it out! @codeorg',
    ),
    url: shareUrl,
  })}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams(
    {url: shareUrl},
  )}`;

  const onShare = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(
      event.currentTarget.href,
      '_blank',
      'width=650,height=650,noopener',
    );
  };

  return (
    <div className={styles.container}>
      {allowedShareTargets.includes('linkedin') &&
        isProfessionalLearning &&
        linkedinAvailable && (
          <IconButton
            aria-label="Share to LinkedIn"
            className={styles.linkedin}
            href={linkedinShareUrl}
            onClick={onShare}
            rel="noopener noreferrer"
            size="small"
            target="_blank"
          >
            <FontAwesomeV6Icon iconFamily="brands" iconName="linkedin" />
          </IconButton>
        )}
      {allowedShareTargets.includes('facebook') && facebookAvailable && (
        <IconButton
          aria-label="Share to Facebook"
          className={styles.facebook}
          href={facebookShareUrl}
          onClick={onShare}
          rel="noopener noreferrer"
          size="small"
          target="_blank"
        >
          <FontAwesomeV6Icon iconFamily="brands" iconName="facebook" />
        </IconButton>
      )}
      {allowedShareTargets.includes('x') && twitterAvailable && (
        <IconButton
          aria-label="Share to Twitter"
          className={styles.twitter}
          href={twitterShareUrl}
          onClick={onShare}
          rel="noopener noreferrer"
          size="small"
          target="_blank"
        >
          <FontAwesomeV6Icon iconFamily="brands" iconName="x-twitter" />
        </IconButton>
      )}
      <Button
        {...(onPrint ? {onClick: onPrint} : {href: printHref})}
        size="small"
        startIcon={<FontAwesomeV6Icon iconName="print" />}
        variant="outlined"
      >
        Print
      </Button>
    </div>
  );
}

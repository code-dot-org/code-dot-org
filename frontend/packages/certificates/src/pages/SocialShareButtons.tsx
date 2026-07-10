import {Button, IconButton} from '@mui/material';
import {useEffect, useState, type MouseEvent} from 'react';

import {checkIfURLIsBlocked} from '@code-dot-org/component-library/common/helpers';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {localization} from '@code-dot-org/core/plugins/localization';

import {ANALYTICS_EVENTS, sendAnalyticsEvent} from '@/lib/analytics';

import styles from './socialShareButtons.module.css';

/**
 * Reachability gate carried over from legacy SocialShare.jsx: each network's
 * button renders only when its favicon loads (school filters often block the
 * whole origin).
 */
function useReachable(faviconUrl: string): boolean {
  const [reachable, setReachable] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkIfURLIsBlocked(faviconUrl).then(blocked => {
      if (mounted) {
        setReachable(!blocked);
      }
    });

    return () => {
      mounted = false;
    };
  }, [faviconUrl]);

  return reachable;
}

export interface SocialShareButtonsProps {
  isPlCourse: boolean;
  /** Print in place when set; otherwise link out via printHref. */
  onPrint?: () => void;
  printHref?: string;
  /** Absolute URL of the certificate share page. */
  shareUrl: string;
  under13: boolean;
  userType?: 'teacher' | 'student' | null;
}

/**
 * Social share-link buttons with legacy query semantics (SocialShare.jsx):
 * Facebook `u`, Twitter `url` + `related=codeorg` + text, LinkedIn `url`
 * (PL courses only); all hidden for under-13 users. Print always renders.
 */
export function SocialShareButtons({
  isPlCourse,
  onPrint,
  printHref,
  shareUrl,
  under13,
  userType,
}: SocialShareButtonsProps) {
  const facebookAvailable = useReachable('https://facebook.com/favicon.ico');
  const twitterAvailable = useReachable('https://x.com/favicon.ico');
  const linkedinAvailable = useReachable(
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

  const onShare = (event: MouseEvent<HTMLAnchorElement>, platform: string) => {
    if (userType === 'teacher') {
      sendAnalyticsEvent(ANALYTICS_EVENTS.CERTIFICATE_SHARED, {platform});
    }

    event.preventDefault();
    window.open(
      event.currentTarget.href,
      '_blank',
      'width=650,height=650,noopener',
    );
  };

  return (
    <div className={styles.container}>
      {!under13 && isPlCourse && linkedinAvailable && (
        <IconButton
          aria-label="Share to LinkedIn"
          className={styles.linkedin}
          href={linkedinShareUrl}
          onClick={event => onShare(event, 'linkedin')}
          rel="noopener noreferrer"
          size="small"
          target="_blank"
        >
          <FontAwesomeV6Icon iconFamily="brands" iconName="linkedin" />
        </IconButton>
      )}
      {!under13 && facebookAvailable && (
        <IconButton
          aria-label="Share to Facebook"
          className={styles.facebook}
          href={facebookShareUrl}
          onClick={event => onShare(event, 'facebook')}
          rel="noopener noreferrer"
          size="small"
          target="_blank"
        >
          <FontAwesomeV6Icon iconFamily="brands" iconName="facebook" />
        </IconButton>
      )}
      {!under13 && twitterAvailable && (
        <IconButton
          aria-label="Share to Twitter"
          className={styles.twitter}
          href={twitterShareUrl}
          onClick={event => onShare(event, 'twitter')}
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

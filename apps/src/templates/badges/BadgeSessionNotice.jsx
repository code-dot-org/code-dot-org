import {Button, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './badges.module.scss';

export default function BadgeSessionNotice({
  expiresAt,
  strings,
  authenticityToken,
}) {
  const [deadline, setDeadline] = useState(expiresAt);
  const [now, setNow] = useState(Date.now() / 1000);
  useEffect(() => {
    let lastSent = 0;
    let pending = false;
    let mounted = true;
    const activity = async event => {
      if (
        !event.isTrusted ||
        document.hidden ||
        pending ||
        Date.now() - lastSent < 60000
      ) {
        return;
      }
      lastSent = Date.now();
      pending = true;
      try {
        const response = await HttpClient.post(
          '/badge_login/activity',
          undefined,
          true
        );
        const data = await response.json();
        if (mounted) {
          setDeadline(data.expires_at);
        }
      } catch {
        // An unavailable network must not extend the local expiry estimate.
      } finally {
        pending = false;
      }
    };
    window.addEventListener('pointerdown', activity, true);
    window.addEventListener('keydown', activity, true);
    const timer = setInterval(() => setNow(Date.now() / 1000), 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
      window.removeEventListener('pointerdown', activity, true);
      window.removeEventListener('keydown', activity, true);
    };
  }, []);
  return (
    <aside
      className={`${styles.controls} ${styles.sessionNotice}`}
      aria-label={strings.title}
    >
      {deadline - now <= 300 && (
        <Typography role="status">
          {deadline <= now ? strings.session_expired : strings.session_warning}
        </Typography>
      )}
      {deadline - now <= 300 && (
        <Button href="/badge_login">{strings.title}</Button>
      )}
      <form method="post" action="/badge_login/switch">
        <input
          type="hidden"
          name="authenticity_token"
          value={authenticityToken}
        />
        <Button type="submit">{strings.sign_out}</Button>
      </form>
    </aside>
  );
}

BadgeSessionNotice.propTypes = {
  expiresAt: PropTypes.number.isRequired,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  authenticityToken: PropTypes.string.isRequired,
};

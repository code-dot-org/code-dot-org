import {Typography} from '@mui/material';
import {useId} from 'react';

import {useField} from '@code-dot-org/component-library/form';
import Link from '@code-dot-org/component-library/link';
import Toggle from '@code-dot-org/component-library/toggle';
import {LmsLinks} from '@code-dot-org/shared-constants';

import styles from './IntegrationSettings.module.css';
import Section from './Section';

/**
 * Account-wide integration settings, one row each. Only LMS roster sync
 * exists today, shown to LMS teachers where legacy shows it.
 */
export default function IntegrationSettings() {
  const rosterSync = useField('lti_roster_sync_enabled');
  const descriptionId = useId();

  return (
    <Section id="integration-settings" title="Settings">
      <ul className={styles.settings}>
        <li className={styles.setting}>
          <Toggle
            name="lti_roster_sync_enabled"
            label="Sync LMS rosters"
            checked={rosterSync.value === 'true'}
            onChange={event =>
              rosterSync.onChange(String(event.target.checked))
            }
            aria-describedby={descriptionId}
          />
          <Typography
            id={descriptionId}
            variant="body3"
            className={styles.description}
          >
            Your LMS integration syncs your course rosters every time you launch
            from your LMS. Learn more about{' '}
            <Link
              href={LmsLinks.ROSTER_SYNC_INSTRUCTIONS_URL}
              openInNewTab
              className={styles.inlineLink}
            >
              roster syncing
            </Link>
            .
          </Typography>
        </li>
      </ul>
    </Section>
  );
}

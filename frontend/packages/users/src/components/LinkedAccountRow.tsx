import {Chip, Typography} from '@mui/material';
import type {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {SimpleList} from '@code-dot-org/component-library/list';

import {linkedAccountProvider} from '../util/linkedAccountProviders';

import styles from './LinkedAccountRow.module.css';

/**
 * One provider card: identity, badges and status on the left; action and
 * connected status on the right.
 */
export default function LinkedAccountRow({
  credentialType,
  name,
  status,
  connected = false,
  action,
}: {
  credentialType: string;
  name: string;
  status: ReactNode;
  connected?: boolean;
  action?: ReactNode;
}) {
  const provider = linkedAccountProvider(credentialType);

  return (
    <li className={styles.row}>
      {provider && (
        <FontAwesomeV6Icon
          {...provider.icon}
          className={styles.icon}
          aria-hidden
        />
      )}
      <div className={styles.identity}>
        <Typography variant="body1" component="h4">
          <strong>{name}</strong>
        </Typography>
        {provider && (
          <SimpleList
            size="s"
            className={styles.badges}
            icon={{
              iconName: 'check-circle',
              iconStyle: 'solid',
              className: styles.badgeIcon,
            }}
            items={provider.badges.map(label => ({key: label, label}))}
          />
        )}
        <Typography variant="body3" className={styles.status}>
          {status}
        </Typography>
      </div>
      <div className={styles.actions}>
        {action}
        {connected && (
          <Chip
            label="Connected"
            size="small"
            icon={<FontAwesomeV6Icon iconName="check" aria-hidden />}
            className={styles.connected}
          />
        )}
      </div>
    </li>
  );
}

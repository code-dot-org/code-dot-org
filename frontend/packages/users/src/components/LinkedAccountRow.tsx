import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import type {ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {linkedAccountIcon} from '../util/linkedAccountProviders';

import styles from './LinkedAccountRow.module.css';

/**
 * One provider card: logo, name and linked email on the left; help link and
 * the connect or disconnect action on the right.
 */
export default function LinkedAccountRow({
  credentialType,
  lmsName = null,
  name,
  email,
  learnMoreUrl,
  note,
  noteId,
  action,
}: {
  credentialType: string;
  /** Names the platform of an LMS login, whose logo it shows. */
  lmsName?: string | null;
  name: string;
  /** Linked rows only. */
  email?: string | null;
  learnMoreUrl?: string;
  /** Why the action is unavailable; the action references it by noteId. */
  note?: string;
  noteId?: string;
  action?: ReactNode;
}) {
  const icon = linkedAccountIcon(credentialType, lmsName);

  return (
    <li className={styles.row}>
      {icon &&
        (typeof icon === 'string' ? (
          <img src={icon} alt="" className={styles.logo} />
        ) : (
          <FontAwesomeV6Icon {...icon} className={styles.icon} aria-hidden />
        ))}
      <div className={styles.identity}>
        <div className={styles.header}>
          <Typography variant="label2" component="h4" className={styles.name}>
            {name}
          </Typography>
          {email && (
            <>
              <span aria-hidden className={styles.bullet}>
                •
              </span>
              <Typography
                variant="body3"
                component="span"
                className={styles.email}
              >
                {email}
              </Typography>
            </>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        {learnMoreUrl && (
          <Button
            variant="text"
            color="secondary"
            size="small"
            href={learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={
              <FontAwesomeV6Icon
                iconName="up-right-from-square"
                iconStyle="solid"
                aria-hidden
              />
            }
          >
            Learn more
            <Box component="span" sx={visuallyHidden}>
              {` about ${name} (opens in a new tab)`}
            </Box>
          </Button>
        )}
        {action}
      </div>
      {note && (
        <Typography id={noteId} variant="body3" className={styles.note}>
          {note}
        </Typography>
      )}
    </li>
  );
}

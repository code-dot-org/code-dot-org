import {Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {linkedAccountIcon} from '../util/linkedAccountProviders';

import styles from './LinkedAccountRow.module.css';

/** One provider card: logo, name and linked email. */
export default function LinkedAccountRow({
  credentialType,
  lmsName = null,
  name,
  email,
}: {
  credentialType: string;
  /** Names the platform of an LMS login, whose logo it shows. */
  lmsName?: string | null;
  name: string;
  /** Linked rows only. */
  email?: string | null;
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
    </li>
  );
}

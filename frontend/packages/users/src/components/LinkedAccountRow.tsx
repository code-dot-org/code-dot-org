import {Box, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useId, type ReactNode} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import Tags from '@code-dot-org/component-library/tags';

import {linkedAccountProvider} from '../util/linkedAccountProviders';

import styles from './LinkedAccountRow.module.css';

const CHECK_ICON = {
  iconName: 'circle-check',
  iconStyle: 'solid',
  placement: 'left',
} as const;

/**
 * One provider card: identity, badges and status on the left; help link,
 * connected chip and the connect/disconnect action on the right. A blocked
 * action states its reason in text, since a disabled button takes no focus.
 */
export default function LinkedAccountRow({
  credentialType,
  name,
  status,
  learnMoreUrl,
  connected = false,
  blockedMessage,
  action,
}: {
  credentialType: string;
  name: string;
  status: ReactNode;
  learnMoreUrl?: string;
  connected?: boolean;
  blockedMessage?: string;
  action: (describedById?: string) => ReactNode;
}) {
  const blockedMessageId = useId();
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
          <Tags
            size="s"
            tagsList={provider.badges.map(label => ({label, icon: CHECK_ICON}))}
          />
        )}
        <Typography variant="body3" className={styles.status}>
          {status}
        </Typography>
      </div>
      <div className={styles.actions}>
        {learnMoreUrl && (
          <Link
            href={learnMoreUrl}
            openInNewTab
            size="m"
            className={styles.learnMore}
          >
            <FontAwesomeV6Icon iconName="circle-question" aria-hidden />
            Learn more
            <Box component="span" sx={visuallyHidden}>
              {` about ${name}`}
            </Box>
          </Link>
        )}
        {connected && (
          <Tags size="s" tagsList={[{label: 'Connected', icon: CHECK_ICON}]} />
        )}
        {action(blockedMessage ? blockedMessageId : undefined)}
      </div>
      {blockedMessage && (
        <Typography
          id={blockedMessageId}
          variant="body3"
          className={styles.blockedMessage}
        >
          {blockedMessage}
        </Typography>
      )}
    </li>
  );
}

import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useId, type ReactNode} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {
  AuthenticationOptionSummary,
  IntegrationsSettings,
  UserSettings,
} from '@code-dot-org/core/api';
import {CapLinks} from '@code-dot-org/shared-constants';

import AccountLinkForm from '../components/AccountLinkForm';
import EmailStatus from '../components/EmailStatus';
import LinkedAccountRow from '../components/LinkedAccountRow';
import {
  linkedAccountName,
  linkedAccountProvider,
} from '../util/linkedAccountProviders';
import {
  connectedAccounts,
  isConnectLocked,
  lockedConnectMessage,
  unconnectedProviders,
} from '../util/linkedAccounts';

import styles from './LinkedAccounts.module.css';
import Section from './Section';

function Group({
  title,
  notice,
  children,
}: {
  title: string;
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box component="section" className={styles.group}>
      <Typography variant="overline1" component="h3" className={styles.label}>
        {title}
      </Typography>
      {notice}
      <ul className={styles.list}>{children}</ul>
    </Box>
  );
}

function ConnectedAccount({
  option,
  integrations,
}: {
  option: AuthenticationOptionSummary;
  integrations: IntegrationsSettings;
}) {
  return (
    <LinkedAccountRow
      credentialType={option.credentialType}
      name={linkedAccountName(option.credentialType, integrations.lmsName)}
      status={<EmailStatus email={option.email} />}
      connected
    />
  );
}

function AvailableAccount({
  provider,
  lockedMessageId,
}: {
  provider: string;
  /** Set while connecting is locked; the notice that says why. */
  lockedMessageId?: string;
}) {
  const locked = !!lockedMessageId;
  const name = linkedAccountName(provider, null);

  return (
    <LinkedAccountRow
      credentialType={provider}
      name={name}
      status="Not connected"
      learnMoreUrl={linkedAccountProvider(provider)?.learnMoreUrl}
      action={
        <AccountLinkForm action={`/users/auth/${provider}?action=connect`}>
          <Button
            type="submit"
            variant="outlined"
            color="secondary"
            disabled={locked}
            aria-describedby={lockedMessageId}
            startIcon={
              locked && <FontAwesomeV6Icon iconName="lock" aria-hidden />
            }
          >
            Connect account
            <Box component="span" sx={visuallyHidden}>
              {` ${name}`}
            </Box>
          </Button>
        </AccountLinkForm>
      }
    />
  );
}

export default function LinkedAccounts({
  settings,
  integrations,
}: {
  settings: UserSettings;
  integrations: IntegrationsSettings;
}) {
  const connected = connectedAccounts(settings.authenticationOptions);
  const available = unconnectedProviders(settings.authenticationOptions);
  const anyLocked = available.some(provider =>
    isConnectLocked(provider, integrations),
  );
  const lockedMessageId = useId();

  return (
    <Section id="linked-accounts" title="Manage linked accounts">
      <Typography variant="body2" className={styles.intro}>
        Connect and manage your third-party SSO login and LMS integrations.
      </Typography>
      {connected.length > 0 && (
        <Group title="My integrations">
          {connected.map(option => (
            <ConnectedAccount
              key={option.id}
              option={option}
              integrations={integrations}
            />
          ))}
        </Group>
      )}
      {available.length > 0 && (
        <Group
          title="Available integrations"
          notice={
            anyLocked && (
              <Alert
                id={lockedMessageId}
                type="warning"
                size="s"
                isImmediateImportance={false}
                text={lockedConnectMessage(settings)}
                link={{
                  text: 'How to get parent or guardian permission',
                  href: CapLinks.PARENTAL_CONSENT_GUIDE_URL,
                  openInNewTab: true,
                }}
              />
            )
          }
        >
          {available.map(provider => (
            <AvailableAccount
              key={provider}
              provider={provider}
              lockedMessageId={
                isConnectLocked(provider, integrations)
                  ? lockedMessageId
                  : undefined
              }
            />
          ))}
        </Group>
      )}
    </Section>
  );
}

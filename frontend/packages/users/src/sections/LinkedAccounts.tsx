import {Box, Typography} from '@mui/material';
import type {ReactNode} from 'react';

import type {
  AuthenticationOptionSummary,
  IntegrationsSettings,
  UserSettings,
} from '@code-dot-org/core/api';

import EmailStatus from '../components/EmailStatus';
import LinkedAccountRow from '../components/LinkedAccountRow';
import {linkedAccountName} from '../util/linkedAccountProviders';
import {connectedAccounts, unconnectedProviders} from '../util/linkedAccounts';

import styles from './LinkedAccounts.module.css';
import Section from './Section';

function Group({title, children}: {title: string; children: ReactNode}) {
  return (
    <Box component="section" className={styles.group}>
      <Typography variant="overline1" component="h3" className={styles.label}>
        {title}
      </Typography>
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

function AvailableAccount({provider}: {provider: string}) {
  return (
    <LinkedAccountRow
      credentialType={provider}
      name={linkedAccountName(provider, null)}
      status="Not connected"
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
        <Group title="Available integrations">
          {available.map(provider => (
            <AvailableAccount key={provider} provider={provider} />
          ))}
        </Group>
      )}
    </Section>
  );
}

import {Box, Typography} from '@mui/material';
import type {ReactNode} from 'react';

import type {
  AuthenticationOptionSummary,
  UserSettings,
} from '@code-dot-org/core/api';

import LinkedAccountRow from '../components/LinkedAccountRow';
import {linkedAccountName} from '../util/linkedAccountProviders';
import {
  connectedAccounts,
  LTI_PROVIDER,
  unconnectedLmsPlatforms,
  unconnectedProviders,
} from '../util/linkedAccounts';

import styles from './LinkedAccounts.module.css';
import Section from './Section';

function Group({title, children}: {title: string; children: ReactNode}) {
  return (
    <Box component="section" className={styles.group}>
      <Typography variant="overline3" component="h3" className={styles.label}>
        {title}
      </Typography>
      <ul className={styles.list}>{children}</ul>
    </Box>
  );
}

function ConnectedAccount({
  option,
  lmsName,
}: {
  option: AuthenticationOptionSummary;
  lmsName: string | null;
}) {
  return (
    <LinkedAccountRow
      credentialType={option.credentialType}
      lmsName={lmsName}
      name={linkedAccountName(option.credentialType, lmsName)}
      email={option.email}
    />
  );
}

function AvailableAccount({provider}: {provider: string}) {
  return (
    <LinkedAccountRow
      credentialType={provider}
      name={linkedAccountName(provider, null)}
    />
  );
}

// No Connect: an LMS login is linked by launching CodeAI from the LMS.
function AvailableLms({platform}: {platform: string}) {
  return (
    <LinkedAccountRow
      credentialType={LTI_PROVIDER}
      lmsName={platform}
      name={linkedAccountName(LTI_PROVIDER, platform)}
    />
  );
}

export default function LinkedAccounts({settings}: {settings: UserSettings}) {
  const connected = connectedAccounts(settings.authenticationOptions);
  const available = unconnectedProviders(settings.authenticationOptions);
  const availableLms = unconnectedLmsPlatforms(
    settings.authenticationOptions,
    settings.integrations.lmsName,
  );

  return (
    <Section
      id="linked-accounts"
      title="Manage linked accounts"
      variant="label1"
      description="Connect and manage your third-party SSO login and LMS integrations."
    >
      {connected.length > 0 && (
        <Group title="My integrations">
          {connected.map(option => (
            <ConnectedAccount
              key={option.id}
              option={option}
              lmsName={settings.integrations.lmsName}
            />
          ))}
        </Group>
      )}
      {available.length + availableLms.length > 0 && (
        <Group title="Available integrations">
          {available.map(provider => (
            <AvailableAccount key={provider} provider={provider} />
          ))}
          {availableLms.map(platform => (
            <AvailableLms key={platform} platform={platform} />
          ))}
        </Group>
      )}
    </Section>
  );
}

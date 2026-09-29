import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useId, type ReactNode} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {
  AuthenticationOptionSummary,
  UserSettings,
} from '@code-dot-org/core/api';
import {CapLinks} from '@code-dot-org/shared-constants';

import AccountLinkForm from '../components/AccountLinkForm';
import LinkedAccountRow from '../components/LinkedAccountRow';
import {
  linkedAccountName,
  linkedAccountProvider,
  lmsPlatform,
} from '../util/linkedAccountProviders';
import {
  connectedAccounts,
  isConnectLocked,
  lockedConnectMessage,
  LTI_PROVIDER,
  unconnectedLmsPlatforms,
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
      <Typography variant="overline3" component="h3" className={styles.label}>
        {title}
      </Typography>
      {notice}
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
  const learnMoreUrl =
    option.credentialType === LTI_PROVIDER
      ? lmsPlatform(lmsName)?.learnMoreUrl
      : linkedAccountProvider(option.credentialType)?.learnMoreUrl;

  return (
    <LinkedAccountRow
      credentialType={option.credentialType}
      lmsName={lmsName}
      name={linkedAccountName(option.credentialType, lmsName)}
      email={option.email}
      learnMoreUrl={learnMoreUrl}
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
      learnMoreUrl={linkedAccountProvider(provider)?.learnMoreUrl}
      action={
        <AccountLinkForm action={`/users/auth/${provider}?action=connect`}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={locked}
            aria-describedby={lockedMessageId}
            startIcon={
              locked && <FontAwesomeV6Icon iconName="lock" aria-hidden />
            }
          >
            Connect
            <Box component="span" sx={visuallyHidden}>
              {` ${name}`}
            </Box>
          </Button>
        </AccountLinkForm>
      }
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
  const anyLocked = available.some(provider =>
    isConnectLocked(provider, settings.integrations),
  );
  const lockedMessageId = useId();

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
                isConnectLocked(provider, settings.integrations)
                  ? lockedMessageId
                  : undefined
              }
            />
          ))}
          {availableLms.map(platform => (
            <AvailableLms key={platform} platform={platform} />
          ))}
        </Group>
      )}
    </Section>
  );
}

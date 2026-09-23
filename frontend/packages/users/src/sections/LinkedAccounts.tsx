import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useId, useState, type ReactNode} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {
  AuthenticationOptionSummary,
  IntegrationsSettings,
  UserSettings,
} from '@code-dot-org/core/api';
import {CapLinks} from '@code-dot-org/shared-constants';

import AccountLinkForm from '../components/AccountLinkForm';
import LinkedAccountRow from '../components/LinkedAccountRow';
import UnlinkLtiModal from '../components/UnlinkLtiModal';
import {
  linkedAccountName,
  linkedAccountProvider,
  lmsPlatform,
} from '../util/linkedAccountProviders';
import {
  connectedAccounts,
  disconnectBlockedMessage,
  isConnectLocked,
  lockedConnectMessage,
  LTI_PROVIDER,
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
      <Typography variant="overline1" component="h3">
        {title}
      </Typography>
      {notice}
      <ul className={styles.list}>{children}</ul>
    </Box>
  );
}

// Legacy parity: a login with no stored address reads as encrypted.
function EmailStatus({email}: {email: string | null}) {
  if (email) return email;
  return (
    <>
      <span aria-hidden>***encrypted***</span>
      <Box component="span" sx={visuallyHidden}>
        Email address encrypted
      </Box>
    </>
  );
}

function ConnectedAccount({
  option,
  settings,
  integrations,
}: {
  option: AuthenticationOptionSummary;
  settings: UserSettings;
  integrations: IntegrationsSettings;
}) {
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const isLti = option.credentialType === LTI_PROVIDER;
  const name = linkedAccountName(option.credentialType, integrations.lmsName);
  const blockedMessage = disconnectBlockedMessage(
    option,
    settings,
    integrations,
  );
  const learnMoreUrl = isLti
    ? lmsPlatform(integrations.lmsName)?.learnMoreUrl
    : linkedAccountProvider(option.credentialType)?.learnMoreUrl;

  const disconnectButton = (describedById?: string, onClick?: () => void) => (
    <Button
      type={onClick ? 'button' : 'submit'}
      variant="outlined"
      disabled={!!blockedMessage}
      aria-describedby={describedById}
      onClick={onClick}
    >
      Disconnect account
      <Box component="span" sx={visuallyHidden}>
        {` ${name}`}
      </Box>
    </Button>
  );

  return (
    <>
      <LinkedAccountRow
        credentialType={option.credentialType}
        name={name}
        status={<EmailStatus email={option.email} />}
        learnMoreUrl={learnMoreUrl}
        connected
        blockedMessage={blockedMessage}
        action={describedById =>
          isLti ? (
            disconnectButton(describedById, () => setUnlinkOpen(true))
          ) : (
            <AccountLinkForm action={`/users/auth/${option.id}/disconnect`}>
              {disconnectButton(describedById)}
            </AccountLinkForm>
          )
        }
      />
      {isLti && (
        <UnlinkLtiModal
          open={unlinkOpen}
          onClose={() => setUnlinkOpen(false)}
          lmsName={name}
          authenticationOptionId={option.id}
        />
      )}
    </>
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
      action={() => (
        <AccountLinkForm action={`/users/auth/${provider}?action=connect`}>
          <Button
            type="submit"
            variant="outlined"
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
      )}
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
              settings={settings}
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

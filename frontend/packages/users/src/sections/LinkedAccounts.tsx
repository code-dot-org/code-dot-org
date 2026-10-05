import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useId, useState, type ReactNode} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {
  AuthenticationOptionSummary,
  UserSettings,
} from '@code-dot-org/core/api';
import {CapLinks} from '@code-dot-org/shared-constants';

import AccountLinkForm from '../components/AccountLinkForm';
import LinkedAccountRow from '../components/LinkedAccountRow';
import UnlinkLmsAccountModal from '../components/UnlinkLmsAccountModal';
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
  settings,
}: {
  option: AuthenticationOptionSummary;
  settings: UserSettings;
}) {
  const {lmsName} = settings.integrations;
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const noteId = useId();
  const isLti = option.credentialType === LTI_PROVIDER;
  const name = linkedAccountName(option.credentialType, lmsName);
  const blockedMessage = disconnectBlockedMessage(
    option,
    settings,
    settings.integrations,
  );
  const learnMoreUrl = isLti
    ? lmsPlatform(lmsName)?.learnMoreUrl
    : linkedAccountProvider(option.credentialType)?.learnMoreUrl;

  const disconnect = (
    <Button
      type={isLti ? 'button' : 'submit'}
      variant="outlined"
      color="tertiary"
      size="small"
      disabled={!!blockedMessage}
      aria-describedby={blockedMessage ? noteId : undefined}
      onClick={isLti ? () => setUnlinkOpen(true) : undefined}
    >
      Disconnect
      <Box component="span" sx={visuallyHidden}>
        {` ${name}`}
      </Box>
    </Button>
  );

  return (
    <>
      <LinkedAccountRow
        credentialType={option.credentialType}
        lmsName={lmsName}
        name={name}
        email={option.email}
        learnMoreUrl={learnMoreUrl}
        note={blockedMessage}
        noteId={noteId}
        action={
          isLti ? (
            disconnect
          ) : (
            <AccountLinkForm action={`/users/auth/${option.id}/disconnect`}>
              {disconnect}
            </AccountLinkForm>
          )
        }
      />
      {isLti && (
        <UnlinkLmsAccountModal
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
      learnMoreUrl={lmsPlatform(platform)?.learnMoreUrl}
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
              settings={settings}
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

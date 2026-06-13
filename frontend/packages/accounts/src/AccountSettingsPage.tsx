import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';

import {DashboardApiClient, useCurrentUser} from '@code-dot-org/core/api';

import {getAccountSettings} from './api/accounts.api';
import {accountsKeys} from './api/accounts.keys';
import AccountTabs, {type AccountTab} from './components/AccountTabs';
import AccountActions from './sections/AccountActions';
import LanguageSection from './sections/Language';
import LoginInformation from './sections/LoginInformation';
import MyInformation from './sections/MyInformation';

import styles from './AccountSettingsPage.module.scss';

const ACCOUNT_DETAILS_TAB = 'account-details';

// Account Details is the only v1 tab; the rest are placeholders (#73223+),
// rendered aria-disabled within the tablist per the a11y spec.
const TABS: AccountTab[] = [
  {id: ACCOUNT_DETAILS_TAB, label: 'Account Details'},
  {id: 'educator-profile', label: 'Educator Profile', disabled: true},
  {id: 'communications', label: 'Communications', disabled: true},
  {id: 'integrations', label: 'Integrations', disabled: true},
];

export interface AccountSettingsPageProps {
  /** Active tab id, supplied by the host (design D11). */
  tab?: string;
  /** Called when the user selects a different tab (design D11). */
  onTabChange?: (tab: string) => void;
}

// Stable identity so the tablist isn't handed a new fn each render when the
// host passes no onTabChange.
const NO_OP = () => {};

/**
 * The "My Account" Account Details page. Reads the current user from the shared
 * query cache and the editable settings from `GET /api/v1/account/settings`.
 */
export default function AccountSettingsPage({
  tab,
  onTabChange,
}: AccountSettingsPageProps) {
  useEffect(() => {
    document.title = 'My Account — Code.org';
  }, []);

  const currentUser = useCurrentUser(DashboardApiClient);
  const settings = useQuery({
    queryKey: accountsKeys.settings(),
    queryFn: ({signal}) => getAccountSettings(signal),
  });

  const activeTab =
    tab && TABS.some(t => t.id === tab && !t.disabled)
      ? tab
      : ACCOUNT_DETAILS_TAB;

  const isPending = currentUser.isPending || settings.isPending;
  const isError = currentUser.isError || settings.isError;

  const retry = () => {
    if (currentUser.isError) void currentUser.refetch();
    if (settings.isError) void settings.refetch();
  };

  return (
    <main
      className={styles.page}
      aria-labelledby="account-page-heading"
      aria-busy={isPending}
    >
      <h1 id="account-page-heading">My Account</h1>

      {isPending && <p role="status">Loading your account…</p>}

      {!isPending && isError && (
        <div role="alert" className={styles.error}>
          <p>We couldn’t load your account settings.</p>
          <button type="button" className={styles.retryButton} onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {!isPending && !isError && settings.data && (
        <AccountTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={onTabChange ?? NO_OP}
        >
          <MyInformation settings={settings.data} />
          <LoginInformation settings={settings.data} />
          <LanguageSection />
          <AccountActions settings={settings.data} />
        </AccountTabs>
      )}
    </main>
  );
}

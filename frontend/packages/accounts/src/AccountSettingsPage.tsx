import {Box, Button, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';

import {DashboardApiClient, useCurrentUser} from '@code-dot-org/core/api';

import {getAccountSettings} from './api/accounts.api';
import {accountsKeys} from './api/accounts.keys';
import AccountDetailsForm from './components/AccountDetailsForm';
import AccountTabs, {type AccountTab} from './components/AccountTabs';
import {FormProvider} from './state/FormContext';

const ACCOUNT_DETAILS_TAB = 'account-details';

// Account Details is the only live v1 tab; the rest are placeholders (#73223+).
// Educator Profile is educator-only (legacy hides it for students).
const TABS: AccountTab[] = [
  {id: ACCOUNT_DETAILS_TAB, label: 'Account Details'},
  {
    id: 'educator-profile',
    label: 'Educator Profile',
    disabled: true,
    educatorOnly: true,
  },
  {id: 'communications', label: 'Communications', disabled: true},
  {id: 'integrations', label: 'Integrations', disabled: true},
];

// Stable identity for the no-onTabChange case.
const NO_OP = () => {};

// Visually-hidden pending status; the host reserves content height, so no
// visible loading flash.
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

export interface AccountSettingsPageProps {
  /** Active tab id, supplied by the host (design D11). */
  tab?: string;
  /** Called when the user selects a different tab (design D11). */
  onTabChange?: (tab: string) => void;
}

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

  const isStudent = settings.data?.userType === 'student';
  const visibleTabs = TABS.filter(t => !(t.educatorOnly && isStudent));

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
    <Box
      component="main"
      aria-labelledby="account-page-heading"
      aria-busy={isPending}
      sx={{
        // Production parity: legacy `.container` caps at 970px, fluid below.
        maxWidth: 970,
        mx: 'auto',
        px: {xs: 2, sm: 3},
        py: 3,
        color: 'var(--text-neutral-primary)',
      }}
    >
      <Typography variant="h3" component="h1" id="account-page-heading">
        My Account
      </Typography>

      {isPending && (
        <Typography role="status" sx={visuallyHidden}>
          Loading your account…
        </Typography>
      )}

      {!isPending && isError && (
        <Box role="alert" sx={{mt: 3, color: 'var(--text-error-primary)'}}>
          <Typography variant="body2">
            We couldn’t load your account settings.
          </Typography>
          <Button variant="contained" onClick={retry} sx={{mt: 1}}>
            Try again
          </Button>
        </Box>
      )}

      {!isPending && !isError && settings.data && (
        <Box sx={{mt: 3}}>
          <AccountTabs
            tabs={visibleTabs}
            activeTab={activeTab}
            onTabChange={onTabChange ?? NO_OP}
          >
            <FormProvider
              initialValues={{
                given_name: settings.data.givenName ?? '',
                family_name: settings.data.familyName ?? '',
                name: settings.data.displayName,
                username: settings.data.username ?? '',
                age: settings.data.age != null ? String(settings.data.age) : '',
                us_state: settings.data.usState ?? '',
              }}
            >
              <AccountDetailsForm settings={settings.data} />
            </FormProvider>
          </AccountTabs>
        </Box>
      )}
    </Box>
  );
}

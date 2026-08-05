import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {useEffect, useRef} from 'react';

import {FormProvider} from '@code-dot-org/component-library/form';
import Tabs, {type TabModel} from '@code-dot-org/component-library/tabs';
import {ToastProvider} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useUserSettings,
  useCurrentUser,
} from '@code-dot-org/core/api';
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

import UsersDetailsForm from './components/UsersDetailsForm';
import styles from './UsersSettingsPage.module.css';

const ACCOUNT_DETAILS_TAB = 'account-details';

// Account Details is the only functional tab; the rest are disabled placeholders
// (legacy parity). Educator Profile is hidden for students.
const TAB_META = [
  {value: ACCOUNT_DETAILS_TAB, text: 'Account Details'},
  {
    value: 'educator-profile',
    text: 'Educator Profile',
    disabled: true,
    educatorOnly: true,
  },
  {value: 'communications', text: 'Communications', disabled: true},
  {value: 'integrations', text: 'Integrations', disabled: true},
];

const NO_OP = () => {};

// The event name and the space in the 'user type' payload key are part of the
// event contract dashboards key on.
const PAGE_VISITED_EVENT = 'Account Settings Page Visited';

export interface UsersSettingsPageProps {
  tab?: string;
  onTabChange?: (tab: string) => void;
}

/**
 * The "My Account" page. Reads the current user from the shared query cache and
 * the editable settings from GET /api/v1/users/me/settings.
 */
export default function UsersSettingsPage({
  tab,
  onTabChange,
}: UsersSettingsPageProps) {
  useEffect(() => {
    document.title = 'My Account — Code.org';
  }, []);

  // current_user gates loading/error (and warms the shared cache the host
  // relies on); the page's own fields all come from `settings`, not its data.
  const currentUser = useCurrentUser(DashboardApiClient);
  const settings = useUserSettings(DashboardApiClient);

  // Reported once at mount from the cache the host primes at bootstrap, so the
  // visit is not delayed by the settings fetch.
  const visitUserType = currentUser.data?.isSignedIn
    ? currentUser.data.userType
    : undefined;
  const visitReported = useRef(false);
  useEffect(() => {
    if (visitReported.current) return;
    visitReported.current = true;
    sendEvent(PAGE_VISITED_EVENT, {'user type': visitUserType});
  }, [visitUserType]);

  const isStudent = settings.data?.userType === 'student';
  const visibleTabs = TAB_META.filter(t => !(t.educatorOnly && isStudent));

  const activeTab =
    tab && TAB_META.some(t => t.value === tab && !t.disabled)
      ? tab
      : ACCOUNT_DETAILS_TAB;

  const isPending = currentUser.isPending || settings.isPending;
  const isError = currentUser.isError || settings.isError;

  const retry = () => {
    if (currentUser.isError) void currentUser.refetch();
    if (settings.isError) void settings.refetch();
  };

  // On recovery (error → loaded) the "Try again" button unmounts and focus
  // would fall to <body>; move it to the page heading so a keyboard/SR user
  // isn't dropped to the top silently. Not on first load — only after an error.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wasError = useRef(false);
  useEffect(() => {
    if (wasError.current && !isPending && !isError && settings.data) {
      headingRef.current?.focus();
    }
    wasError.current = isError;
  }, [isPending, isError, settings.data]);

  // Only Account Details carries content; the placeholders render an empty panel.
  const tabs: TabModel[] = visibleTabs.map(t => ({
    value: t.value,
    text: t.text,
    disabled: t.disabled,
    tabContent:
      t.value === ACCOUNT_DETAILS_TAB && settings.data ? (
        <FormProvider
          initialValues={{
            given_name: settings.data.givenName ?? '',
            family_name: settings.data.familyName ?? '',
            name: settings.data.displayName,
            username: settings.data.username ?? '',
            age: settings.data.age != null ? String(settings.data.age) : '',
            us_state: settings.data.usState ?? '',
            gender: settings.data.gender ?? '',
          }}
        >
          <UsersDetailsForm settings={settings.data} />
        </FormProvider>
      ) : null,
  }));

  return (
    <Box
      component="main"
      aria-labelledby="account-page-heading"
      aria-busy={isPending}
      sx={{
        // Legacy parity: .container caps at 970px, fluid below.
        maxWidth: 970,
        mx: 'auto',
        px: {xs: 2, sm: 3},
        py: 3,
        color: 'var(--text-neutral-primary)',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        id="account-page-heading"
        ref={headingRef}
        tabIndex={-1}
      >
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

      {/* Every toast here confirms a save the user just asked for, so it waits its
          turn instead of interrupting the screen reader; failures surface inline
          on the field or in the dialog, not as a toast. */}
      {!isPending && !isError && settings.data && (
        <ToastProvider politeness="polite">
          <Box className={styles.tabs} sx={{mt: 3}}>
            <Tabs
              name="account-settings"
              type="primary"
              mode="light"
              size="m"
              tabs={tabs}
              defaultSelectedTabValue={activeTab}
              onChange={onTabChange ?? NO_OP}
            />
          </Box>
        </ToastProvider>
      )}
    </Box>
  );
}

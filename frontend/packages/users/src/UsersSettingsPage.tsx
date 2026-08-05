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

import EducatorProfileForm from './components/EducatorProfileForm';
import UsersDetailsForm from './components/UsersDetailsForm';
import styles from './UsersSettingsPage.module.css';

const ACCOUNT_DETAILS_TAB = 'account-details';
const EDUCATOR_PROFILE_TAB = 'educator-profile';

// The placeholder tabs ship disabled rather than hidden, for legacy parity.
const TAB_META = [
  {value: ACCOUNT_DETAILS_TAB, text: 'Account Details'},
  {
    value: EDUCATOR_PROFILE_TAB,
    text: 'Educator Profile',
    educatorOnly: true,
  },
  {value: 'communications', text: 'Communications', disabled: true},
  {value: 'integrations', text: 'Integrations', disabled: true},
];

const NO_OP = () => {};

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

  const isStudent = settings.data?.userType === 'student';
  const visibleTabs = TAB_META.filter(t => !(t.educatorOnly && isStudent));

  const activeTab =
    tab && visibleTabs.some(t => t.value === tab && !t.disabled)
      ? tab
      : ACCOUNT_DETAILS_TAB;

  // A requested tab can disappear under the user (an educator switches to
  // student). DSCO's Tabs falls back to the first tab without telling the host,
  // leaving its URL pointing at a tab that no longer exists.
  useEffect(() => {
    if (tab && tab !== activeTab) onTabChange?.(activeTab);
  }, [tab, activeTab, onTabChange]);

  const isPending = currentUser.isPending || settings.isPending;
  // Only until first data: a failed background refetch keeps the cached
  // settings, because unmounting the tabs would discard form state.
  const isError =
    (currentUser.isError && !currentUser.data) ||
    (settings.isError && !settings.data);

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

  const tabContent = (value: string) => {
    const data = settings.data;
    if (!data) return null;

    if (value === ACCOUNT_DETAILS_TAB) {
      return (
        <FormProvider
          initialValues={{
            given_name: data.givenName ?? '',
            family_name: data.familyName ?? '',
            name: data.displayName,
            username: data.username ?? '',
            age: data.age != null ? String(data.age) : '',
            us_state: data.usState ?? '',
            gender: data.gender ?? '',
          }}
        >
          <UsersDetailsForm settings={data} />
        </FormProvider>
      );
    }

    if (value === EDUCATOR_PROFILE_TAB) {
      return (
        <FormProvider initialValues={{educator_role: data.educatorRole ?? ''}}>
          <EducatorProfileForm settings={data} />
        </FormProvider>
      );
    }

    return null;
  };

  const tabs: TabModel[] = visibleTabs.map(t => ({
    value: t.value,
    text: t.text,
    disabled: t.disabled,
    tabContent: tabContent(t.value),
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
              scrollable
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

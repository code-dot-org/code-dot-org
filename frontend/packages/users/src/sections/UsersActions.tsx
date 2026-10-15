import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Field} from '@code-dot-org/component-library/form';
import type {UserType} from '@code-dot-org/core/api';

import DeleteUserModal from '../components/DeleteUserModal';
import SignOutOtherSessionsModal from '../components/SignOutOtherSessionsModal';
import UsersTypeModal from '../components/UsersTypeModal';

import Section from './Section';
import type {SectionProps} from './types';

const TYPE_ITEMS = [
  {value: 'student', text: 'Student'},
  {value: 'teacher', text: 'Educator'},
];

/**
 * The "Account Actions" section: account-level operations consequential enough
 * to confirm in a dialog, rather than edit inline and save with the rest of the
 * profile. Changing type and deleting are both server-gated, on
 * `canChangeUserType` and `canDeleteOwnAccount`.
 */
export default function UsersActions({settings}: SectionProps) {
  // The dropdown stays bound to the current type; a selection only opens the
  // confirmation modal, so dismissing reverts it.
  const [prospectiveType, setProspectiveType] = useState<UserType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const onTypeSelect = (value: string) => {
    if (
      (value === 'student' || value === 'teacher') &&
      value !== settings.userType
    ) {
      setProspectiveType(value);
    }
  };

  return (
    <Section id="account-actions" title="Account Actions">
      {settings.canChangeUserType && (
        <Box sx={{mb: 3}}>
          <Field>
            <SimpleDropdown
              name="user_type"
              labelText="Account type"
              items={TYPE_ITEMS}
              selectedValue={settings.userType}
              onChange={event => onTypeSelect(event.target.value)}
              styleAsFormField
            />
          </Field>
          <UsersTypeModal
            open={prospectiveType !== null}
            prospectiveType={prospectiveType}
            onClose={() => setProspectiveType(null)}
          />
        </Box>
      )}

      <Box sx={{mb: 3}}>
        <Typography
          variant="label1"
          component="h3"
          sx={{color: 'var(--text-neutral-primary)', mb: 1}}
        >
          Manage Other Sessions
        </Typography>
        <Typography variant="body2" sx={{mb: 2}}>
          Click the button below to sign out of any other browsers and devices
          where you might be signed in.
        </Typography>
        <Button onClick={() => setSessionsOpen(true)} sx={{px: 0}}>
          Sign Out All Other Sessions
        </Button>
        <SignOutOtherSessionsModal
          open={sessionsOpen}
          onClose={() => setSessionsOpen(false)}
        />
      </Box>

      <Box>
        <Typography
          variant="overline2"
          component="p"
          sx={{color: 'var(--text-neutral-secondary)', mb: 1}}
        >
          Danger zone
        </Typography>
        {settings.canDeleteOwnAccount ? (
          <>
            <Button
              color="error"
              onClick={() => setDeleteOpen(true)}
              sx={{px: 0}}
            >
              Delete my account
            </Button>
            <DeleteUserModal
              open={deleteOpen}
              onClose={() => setDeleteOpen(false)}
              settings={settings}
            />
          </>
        ) : (
          // Legacy parity: explain why deletion is blocked, not a dead disabled button.
          <Typography variant="body2">
            You do not have permission to delete this account because it is
            managed by your teacher. Your teacher(s) will need to remove you
            from their sections before you can delete your account.
          </Typography>
        )}
      </Box>
    </Section>
  );
}

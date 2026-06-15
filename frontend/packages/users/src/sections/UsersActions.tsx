import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import type {UserType} from '@code-dot-org/core/api';

import DeleteUserModal from '../components/DeleteUserModal';
import Field from '../components/Field';
import SignOutOtherSessionsModal from '../components/SignOutOtherSessionsModal';
import UsersTypeModal from '../components/UsersTypeModal';

import Section from './Section';
import type {SectionProps} from './types';

const TYPE_ITEMS = [
  {value: 'student', text: 'Student'},
  {value: 'teacher', text: 'Educator'},
];

// Consequences shown upfront, before the button, per legacy parity.
const STUDENT_DELETE_WARNING =
  'Deleting your account will permanently erase all personal information, coursework, and projects connected to this account.';
const TEACHER_DELETE_WARNING =
  "Deleting your account will permanently erase all personal information, coursework, projects, and professional learning information connected to this account after 28 days. It will also delete your sections and your students' accounts that don't have a personal login or aren't in another teacher's section. Please make sure you have the authority to delete these students' education records before deleting your own account.";

export default function UsersActions({settings}: SectionProps) {
  // The dropdown stays bound to the current type; a selection only opens the
  // confirmation modal, so dismissing reverts it.
  const [prospectiveType, setProspectiveType] = useState<UserType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const isTeacher = settings.userType === 'teacher';

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
        <Typography
          variant="label1"
          component="h3"
          sx={{color: 'var(--text-neutral-primary)', mb: 1}}
        >
          Delete account
        </Typography>
        {settings.canDeleteOwnAccount ? (
          <>
            <Typography variant="body2" sx={{mb: 2}}>
              {isTeacher ? TEACHER_DELETE_WARNING : STUDENT_DELETE_WARNING}
            </Typography>
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

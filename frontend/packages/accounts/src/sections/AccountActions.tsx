import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';

import type {UserType} from '../api/accounts.types';
import AccountTypeModal from '../components/AccountTypeModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import Field from '../components/Field';

import Section from './Section';
import type {SectionProps} from './types';

const TYPE_ITEMS = [
  {value: 'student', text: 'Student'},
  {value: 'teacher', text: 'Educator'},
];

export default function AccountActions({settings}: SectionProps) {
  // The dropdown stays bound to the current type; a selection only opens the
  // confirmation modal with the prospective value, so dismissing reverts it.
  const [prospectiveType, setProspectiveType] = useState<UserType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
          <AccountTypeModal
            open={prospectiveType !== null}
            prospectiveType={prospectiveType}
            onClose={() => setProspectiveType(null)}
          />
        </Box>
      )}

      <Box>
        <Typography
          variant="overline2"
          component="p"
          sx={{color: 'var(--text-neutral-secondary)', mb: 1}}
        >
          Danger zone
        </Typography>
        <Button
          color="error"
          onClick={() => setDeleteOpen(true)}
          disabled={!settings.canDeleteOwnAccount}
          sx={{px: 0}}
        >
          Delete my account
        </Button>
        <DeleteAccountModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          settings={settings}
        />
      </Box>
    </Section>
  );
}

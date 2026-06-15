import {Box} from '@mui/material';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Field, useField} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';

import Section from './Section';
import type {SectionProps} from './types';

export default function MyInformation({settings}: SectionProps) {
  const isTeacher = settings.userType === 'teacher';
  const givenName = useField('given_name');
  const familyName = useField('family_name');
  const displayName = useField('name');
  const age = useField('age');
  const usState = useField('us_state');

  // Disabled placeholder: shows "Select …" while unset, but can't be re-selected
  // to blank a value. Age and (US-student) state are required — and a blank age
  // is a server no-op, so the SPA would otherwise show "saved" yet desync. The
  // option lists come from the server (settings) — the single Rails source.
  const ageItems = [
    {value: '', text: 'Select age', disabled: true},
    ...settings.ageOptions,
  ];
  const usStateItems = [
    {value: '', text: 'Select a state', disabled: true},
    ...settings.usStateOptions,
  ];

  const displayNameField = (
    <Field>
      <TextField
        label="Display name"
        name="name"
        value={displayName.value}
        onChange={event => displayName.onChange(event.target.value)}
        errorMessage={displayName.errors[0]}
        aria-invalid={displayName.errors.length > 0 || undefined}
        autoComplete="nickname"
        helperMessage={
          isTeacher ? 'This is what your students will see.' : undefined
        }
      />
    </Field>
  );

  return (
    <Section id="my-information" title="My Information">
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        {isTeacher ? (
          <>
            <Field>
              <TextField
                label="First name"
                name="given_name"
                value={givenName.value}
                onChange={event => givenName.onChange(event.target.value)}
                errorMessage={givenName.errors[0]}
                aria-invalid={givenName.errors.length > 0 || undefined}
                autoComplete="given-name"
              />
            </Field>
            <Field>
              <TextField
                label="Last name"
                name="family_name"
                value={familyName.value}
                onChange={event => familyName.onChange(event.target.value)}
                errorMessage={familyName.errors[0]}
                aria-invalid={familyName.errors.length > 0 || undefined}
                autoComplete="family-name"
              />
            </Field>
            {displayNameField}
          </>
        ) : (
          <>
            {/* Students lead with display name; first/last are teacher-only. */}
            {displayNameField}
            <Field>
              <SimpleDropdown
                name="age"
                labelText="Age"
                items={ageItems}
                selectedValue={age.value}
                onChange={event => age.onChange(event.target.value)}
                errorMessage={age.errors[0]}
                styleAsFormField
              />
            </Field>
            <Field>
              <SimpleDropdown
                name="us_state"
                labelText="State"
                items={usStateItems}
                selectedValue={usState.value}
                onChange={event => usState.onChange(event.target.value)}
                errorMessage={usState.errors[0]}
                styleAsFormField
              />
            </Field>
          </>
        )}
      </Box>
    </Section>
  );
}

import {Box} from '@mui/material';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';

import Field from '../components/Field';
import {useField} from '../state/FormContext';
import {AGE_OPTIONS, US_STATE_OPTIONS} from '../util/profileOptions';

import Section from './Section';
import type {SectionProps} from './types';

// Empty placeholder first, so an unset age/state shows "Select …" rather than
// silently defaulting to the first option (legacy parity).
const AGE_ITEMS = [{value: '', text: 'Select age'}, ...AGE_OPTIONS];
const US_STATE_ITEMS = [
  {value: '', text: 'Select a state'},
  ...US_STATE_OPTIONS,
];

export default function MyInformation({settings}: SectionProps) {
  const isTeacher = settings.userType === 'teacher';
  const givenName = useField('given_name');
  const familyName = useField('family_name');
  const displayName = useField('name');
  const age = useField('age');
  const usState = useField('us_state');

  const displayNameField = (
    <Field>
      <TextField
        label="Display name"
        name="name"
        value={displayName.value}
        onChange={event => displayName.onChange(event.target.value)}
        errorMessage={displayName.errors[0]}
        aria-invalid={displayName.errors.length > 0 || undefined}
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
                items={AGE_ITEMS}
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
                items={US_STATE_ITEMS}
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

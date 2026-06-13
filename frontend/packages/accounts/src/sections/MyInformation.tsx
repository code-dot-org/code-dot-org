import {Box} from '@mui/material';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';

import {useField} from '../state/FormContext';
import {AGE_OPTIONS, US_STATE_OPTIONS} from '../util/profileOptions';

import Section from './Section';
import type {SectionProps} from './types';

// Field-level server errors set aria-invalid on the input and render the
// message; the save bar persists all pending changes in one PATCH (task 5.3).
// Student variant (D8): last name dropped, age + US state added.
export default function MyInformation({settings}: SectionProps) {
  const isTeacher = settings.userType === 'teacher';
  const givenName = useField('given_name');
  const familyName = useField('family_name');
  const displayName = useField('name');
  const age = useField('age');
  const usState = useField('us_state');

  return (
    <Section id="my-information" title="My Information">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          '& > *': {flex: '1 1 240px'},
        }}
      >
        <TextField
          label="First name"
          name="given_name"
          value={givenName.value}
          onChange={event => givenName.onChange(event.target.value)}
          errorMessage={givenName.errors[0]}
          aria-invalid={givenName.errors.length > 0 || undefined}
        />
        {isTeacher && (
          <TextField
            label="Last name"
            name="family_name"
            value={familyName.value}
            onChange={event => familyName.onChange(event.target.value)}
            errorMessage={familyName.errors[0]}
            aria-invalid={familyName.errors.length > 0 || undefined}
          />
        )}
      </Box>

      {!isTeacher && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
            '& > *': {flex: '1 1 240px'},
          }}
        >
          <SimpleDropdown
            name="age"
            labelText="Age"
            items={AGE_OPTIONS}
            selectedValue={age.value}
            onChange={event => age.onChange(event.target.value)}
            errorMessage={age.errors[0]}
          />
          <SimpleDropdown
            name="us_state"
            labelText="State"
            items={US_STATE_OPTIONS}
            selectedValue={usState.value}
            onChange={event => usState.onChange(event.target.value)}
            errorMessage={usState.errors[0]}
          />
        </Box>
      )}

      <TextField
        label="Display name"
        name="name"
        value={displayName.value}
        onChange={event => displayName.onChange(event.target.value)}
        errorMessage={displayName.errors[0]}
        aria-invalid={displayName.errors.length > 0 || undefined}
        helperMessage="This is what your students will see."
      />
    </Section>
  );
}

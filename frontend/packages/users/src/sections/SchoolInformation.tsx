import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Field} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';

import UpdateSchoolModal from '../components/UpdateSchoolModal';

import Section from './Section';
import type {SectionProps} from './types';

// DSCO wants an onChange even on a read-only field.
const NOOP = () => {};

const EMPTY_HINT_ID = 'school-information-empty-hint';

export default function SchoolInformation({settings}: SectionProps) {
  const [open, setOpen] = useState(false);
  const schoolName = settings.schoolInfo?.schoolName ?? '';

  return (
    <Section id="school-information" title="School Information">
      <Typography variant="body2" sx={{mb: 2}}>
        Keep your school information up-to-date.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {/* readOnly, not disabled: the value is still worth reaching by keyboard
            and announcing, and the dialog below is how it changes. */}
        <Field>
          <TextField
            label="My school"
            name="school_name_display"
            value={schoolName}
            onChange={NOOP}
            readOnly
            aria-describedby={schoolName ? undefined : EMPTY_HINT_ID}
          />
        </Field>
        {/* A sibling, not the field's helperMessage: DSCO renders helper text
            inside the <label>, where it would fold into the field's name. */}
        {!schoolName && (
          <Typography
            id={EMPTY_HINT_ID}
            variant="body3"
            sx={{color: 'var(--text-neutral-secondary)', mt: 0.5}}
          >
            No school on record yet.
          </Typography>
        )}
        <Button onClick={() => setOpen(true)} sx={{px: 0}}>
          Update my school
        </Button>
        <UpdateSchoolModal
          open={open}
          onClose={() => setOpen(false)}
          schoolInfo={settings.schoolInfo}
        />
      </Box>
    </Section>
  );
}

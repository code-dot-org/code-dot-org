import TextField from '@code-dot-org/component-library/textField';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import style from './signInStyles.module.scss';

export interface SectionCodeEntryProps {
  // Visible heading above the field, e.g. "Enter your 6 letter section code".
  sectionCodeHeading: string;
  // Accessible name for the input; the field has no visible label of its own
  // to avoid duplicating the heading text.
  sectionCodeLabel: string;
  sectionCodePlaceholder: string;
  defaultSectionCode: string;
  goLabel: string;
  // Where the GET form submits (student_user_new_path -> /users/new).
  formAction: string;
}

const SectionCodeEntry: React.FunctionComponent<SectionCodeEntryProps> = ({
  sectionCodeHeading,
  sectionCodeLabel,
  sectionCodePlaceholder,
  defaultSectionCode,
  goLabel,
  formAction,
}) => {
  const [sectionCode, setSectionCode] = useState(defaultSectionCode || '');

  return (
    <div className={style.sectionCode}>
      <Typography variant="h6" component="h6">
        {sectionCodeHeading}
      </Typography>
      <form action={formAction} method="get" className={style.sectionCodeForm}>
        <TextField
          id="section_code"
          className={style.sectionCodeField}
          name="section_code"
          aria-label={sectionCodeLabel}
          placeholder={sectionCodePlaceholder}
          value={sectionCode}
          onChange={e => setSectionCode(e.target.value)}
        />
        <MuiButton
          id="section_code_submit"
          variant="contained"
          color="primary"
          type="submit"
        >
          {goLabel}
        </MuiButton>
      </form>
    </div>
  );
};

export default SectionCodeEntry;

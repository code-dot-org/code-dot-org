import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import style from './signInStyles.module.scss';

export interface SectionCodeEntryProps {
  // Field label, e.g. "Enter your 6 letter section code". Rendered as the
  // TextField's own label so it matches the sign-in fields' labels exactly
  // (same size, weight, padding, and top alignment).
  sectionCodeLabel: string;
  sectionCodePlaceholder: string;
  defaultSectionCode: string;
  goLabel: string;
  // Where the GET form submits (student_user_new_path -> /users/new).
  formAction: string;
}

const SectionCodeEntry: React.FunctionComponent<SectionCodeEntryProps> = ({
  sectionCodeLabel,
  sectionCodePlaceholder,
  defaultSectionCode,
  goLabel,
  formAction,
}) => {
  const [sectionCode, setSectionCode] = useState(defaultSectionCode || '');

  return (
    <div className={style.sectionCode}>
      <form action={formAction} method="get" className={style.sectionCodeForm}>
        <TextField
          id="section_code"
          className={style.sectionCodeField}
          name="section_code"
          label={sectionCodeLabel}
          placeholder={sectionCodePlaceholder}
          value={sectionCode}
          onChange={e => setSectionCode(e.target.value)}
          required
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

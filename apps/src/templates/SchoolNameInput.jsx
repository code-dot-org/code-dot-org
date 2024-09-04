import PropTypes from 'prop-types';
import React, {useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import i18n from '@cdo/locale';

import {SCHOOL_NAME_SESSION_KEY} from '../signUpFlow/signUpFlowConstants';

export default function SchoolNameInput({fieldNames}) {
  const detectedName = sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY) || '';
  const [schoolName, setSchoolName] = useState(detectedName);

  return (
    <TextField
      name={fieldNames.schoolName}
      label={i18n.schoolOrganizationQuestion()}
      onChange={e => {
        setSchoolName(e.target.value);
        sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, e.target.value);
      }}
      value={schoolName}
    />
  );
}

SchoolNameInput.propTypes = {
  fieldNames: PropTypes.object,
};

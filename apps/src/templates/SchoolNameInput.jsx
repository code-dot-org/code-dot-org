import PropTypes from 'prop-types';
import React, {useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import {SCHOOL_NAME_SESSION_KEY} from '../signUpFlow/signUpFlowConstants';

import style from './school-association.module.scss';

export default function SchoolNameInput({fieldNames}) {
  const detectedName = sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY) || '';
  const [schoolName, setSchoolName] = useState(detectedName);

  return (
    <label>
      <BodyThreeText className={style.padding}>
        <strong>{i18n.schoolOrganizationQuestion()}</strong>
      </BodyThreeText>
      <TextField
        name={fieldNames.schoolName}
        onChange={e => {
          setSchoolName(e.target.value);
          sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, e.target.value);
        }}
        value={schoolName}
      />
    </label>
  );
}

SchoolNameInput.propTypes = {
  fieldNames: PropTypes.object,
};

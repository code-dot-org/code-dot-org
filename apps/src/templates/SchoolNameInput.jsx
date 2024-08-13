import PropTypes from 'prop-types';
import React, {useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import style from './school-association.module.scss';

const SCHOOL_NAME = 'schoolName';
export default function SchoolNameInput({fieldNames}) {
  const detectedName = sessionStorage.getItem(SCHOOL_NAME) || '';
  const [schoolName, setSchoolName] = useState(detectedName);

  return (
    <label>
      <BodyTwoText className={style.padding} visualAppearance={'heading-xs'}>
        {i18n.schoolOrganizationQuestion()}
      </BodyTwoText>
      <TextField
        name={fieldNames.schoolName}
        onChange={e => {
          setSchoolName(e.target.value);
          sessionStorage.setItem(SCHOOL_NAME, e.target.value);
        }}
        value={schoolName}
      />
    </label>
  );
}

SchoolNameInput.propTypes = {
  fieldNames: PropTypes.object,
};

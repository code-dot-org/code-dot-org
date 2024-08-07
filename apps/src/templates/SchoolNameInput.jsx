import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import {SCHOOL_NAME_SESSION_KEY} from '../signUpFlow/signUpFlowConstants';

import style from './school-association.module.scss';

export default function SchoolNameInput({fieldNames}) {
  const detectedName = sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY) || '';
  const [schoolName, setSchoolName] = useState(detectedName);

  return (
    <label>
      <BodyTwoText className={style.padding} visualAppearance={'heading-xs'}>
        {i18n.schoolOrganizationQuestion()}
      </BodyTwoText>
      <input
        type="text"
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

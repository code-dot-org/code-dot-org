import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';

export default function SchoolNameInput({fieldNames}) {
  const [schoolName, setSchoolName] = useState('');

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
        }}
        value={schoolName}
      />
    </label>
  );
}

SchoolNameInput.propTypes = {
  fieldNames: PropTypes.object,
};

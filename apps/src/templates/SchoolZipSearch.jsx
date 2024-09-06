import PropTypes from 'prop-types';
import React from 'react';

import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import style from './school-association.module.scss';

export default function SchoolZipSearch({
  fieldNames,
  schoolZip,
  setSchoolZip,
  schoolZipIsValid,
}) {
  const handleZipChange = zip => {
    setSchoolZip(zip);
  };

  return (
    <div className={style.inputContainer}>
      <label>
        <TextField
          id="uitest-school-zip"
          name={fieldNames.schoolZip}
          label={i18n.enterYourSchoolZip()}
          onChange={e => handleZipChange(e.target.value)}
          value={schoolZip}
          placeholder="00000"
        />
        {schoolZip && !schoolZipIsValid && (
          <BodyThreeText className={style.errorMessage}>
            {i18n.zipInvalidMessage()}
          </BodyThreeText>
        )}
      </label>
    </div>
  );
}

SchoolZipSearch.propTypes = {
  fieldNames: PropTypes.object,
  schoolZip: PropTypes.string,
  setSchoolZip: PropTypes.func,
  schoolZipIsValid: PropTypes.bool,
};

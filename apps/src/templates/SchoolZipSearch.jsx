import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';

import {ZIP_REGEX} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import i18n from '@cdo/locale';

import style from './school-association.module.scss';

export default function SchoolZipSearch({fieldNames, schoolZip, setSchoolZip}) {
  const schoolZipIsValid = useMemo(
    () => ZIP_REGEX.test(schoolZip),
    [schoolZip]
  );

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
        />
        {schoolZip && !schoolZipIsValid && (
          <Typography
            className={style.errorMessage}
            variant="body3"
            gutterBottom
          >
            {i18n.zipInvalidMessage()}
          </Typography>
        )}
      </label>
    </div>
  );
}

SchoolZipSearch.propTypes = {
  fieldNames: PropTypes.object,
  schoolZip: PropTypes.string,
  setSchoolZip: PropTypes.func,
};

import PropTypes from 'prop-types';
import React, {useMemo} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {BodyTwoText, Heading2} from '@cdo/apps/componentLibrary/typography';
import {
  CLICK_TO_ADD,
  NO_SCHOOL_SETTING,
  SELECT_A_SCHOOL,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import SchoolZipSearch from '@cdo/apps/templates/SchoolZipSearch';
import i18n from '@cdo/locale';

import {getCountriesUsFirst} from '../schoolInfo/utils/getCountriesUsFirst';

import style from './school-association.module.scss';

const SEARCH_DEFAULTS = [
  {value: CLICK_TO_ADD, text: i18n.schoolClickToAdd()},
  {value: NO_SCHOOL_SETTING, text: i18n.noSchoolSetting()},
];

const COUNTRIES_US_FIRST = getCountriesUsFirst();

export default function SchoolDataInputs({
  schoolId,
  country,
  schoolName,
  schoolZip,
  schoolsList,
  schoolZipIsValid,
  setSchoolId,
  setCountry,
  setSchoolName,
  setSchoolZip,
  includeHeaders = true,
  fieldNames = {
    country: 'user[school_info_attributes][country]',
    ncesSchoolId: 'user[school_info_attributes][school_id]',
    schoolName: 'user[school_info_attributes][school_name]',
    schoolZip: 'user[school_info_attributes][school_zip]',
  },
}) {
  // We don't want to display any fields to start that won't eventually be
  // necessary, so updating any time country changes
  const countryIsUS = useMemo(() => country === US_COUNTRY_CODE, [country]);

  const inputManually = useMemo(() => schoolId === CLICK_TO_ADD, [schoolId]);

  const schoolSelectOptions = useMemo(
    () => [
      {value: SELECT_A_SCHOOL, text: i18n.selectASchool()},
      ...schoolsList,
    ],
    [schoolsList]
  );

  const handleCountryChange = c => {
    setCountry(c);
  };

  const labelClassName = schoolZipIsValid ? '' : style.disabledLabel;

  const handleSchoolChange = id => {
    setSchoolId(id);
  };

  return (
    <div className={style.schoolAssociationWrapper}>
      {includeHeaders && (
        <div className={style.headerContainer}>
          <Heading2>{i18n.censusHeading()}</Heading2>
          <BodyTwoText>{i18n.schoolInfoInterstitialTitle()}</BodyTwoText>
        </div>
      )}
      <div className={style.inputContainer}>
        <SimpleDropdown
          id="uitest-country-dropdown"
          name={fieldNames.country}
          labelText={i18n.whatCountry()}
          items={COUNTRIES_US_FIRST}
          selectedValue={country}
          onChange={e => handleCountryChange(e.target.value)}
          size="m"
        />
        {countryIsUS && (
          <div>
            <SchoolZipSearch
              fieldNames={{
                schoolZip: fieldNames.schoolZip,
                ncesSchoolId: fieldNames.ncesSchoolId,
                schoolName: fieldNames.schoolName,
              }}
              schoolId={schoolId}
              setSchoolId={setSchoolId}
              schoolZip={schoolZip}
              setSchoolZip={setSchoolZip}
              schoolsList={schoolsList}
              schoolZipIsValid={schoolZipIsValid}
            />
          </div>
        )}
        {!countryIsUS && (
          <SchoolNameInput
            fieldNames={{
              schoolName: fieldNames.schoolName,
            }}
            schoolName={schoolName}
            setSchoolName={setSchoolName}
          />
        )}
        {countryIsUS && !inputManually && (
          <div>
            <SimpleDropdown
              id="uitest-school-dropdown"
              disabled={!schoolZipIsValid}
              name={fieldNames.ncesSchoolId}
              className={labelClassName}
              labelText={i18n.selectYourSchool()}
              itemGroups={[
                {
                  label: i18n.schools(),
                  groupItems: schoolSelectOptions,
                },
                {
                  label: i18n.additionalOptions(),
                  groupItems: SEARCH_DEFAULTS,
                },
              ]}
              selectedValue={schoolId}
              onChange={e => handleSchoolChange(e.target.value)}
              size="m"
            />
            <Button
              text={i18n.noSchoolSetting()}
              disabled={!schoolZipIsValid}
              color={'purple'}
              type={'tertiary'}
              size={'xs'}
              onClick={e => {
                e.preventDefault();
                handleSchoolChange(NO_SCHOOL_SETTING);
              }}
            />
          </div>
        )}
        {countryIsUS && inputManually && (
          <div>
            <SchoolNameInput
              fieldNames={{schoolName: fieldNames.schoolName}}
              schoolName={schoolName}
              setSchoolName={setSchoolName}
            />
            <Button
              text={i18n.returnToResults()}
              color={'purple'}
              type={'tertiary'}
              size={'xs'}
              onClick={() => {
                handleSchoolChange(SELECT_A_SCHOOL);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

SchoolDataInputs.propTypes = {
  includeHeaders: PropTypes.bool,
  fieldNames: PropTypes.object,
  schoolId: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  schoolName: PropTypes.string.isRequired,
  schoolZip: PropTypes.string.isRequired,
  schoolsList: PropTypes.arrayOf(
    PropTypes.shape({value: PropTypes.string, text: PropTypes.string})
  ).isRequired,
  schoolZipIsValid: PropTypes.bool.isRequired,
  setSchoolId: PropTypes.func.isRequired,
  setCountry: PropTypes.func.isRequired,
  setSchoolName: PropTypes.func.isRequired,
  setSchoolZip: PropTypes.func.isRequired,
};

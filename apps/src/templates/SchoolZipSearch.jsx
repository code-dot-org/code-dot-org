import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import i18n from '@cdo/locale';

import {
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
} from '../signUpFlow/signUpFlowConstants';

import style from './school-association.module.scss';

export const SELECT_A_SCHOOL = 'selectASchool';
export const CLICK_TO_ADD = 'clickToAdd';
export const NO_SCHOOL_SETTING = 'noSchoolSetting';
const SEARCH_DEFAULTS = [
  {value: CLICK_TO_ADD, text: i18n.schoolClickToAdd()},
  {value: NO_SCHOOL_SETTING, text: i18n.noSchoolSetting()},
];
const ZIP_REGEX = new RegExp(/(^\d{5}$)/);

// Controls the logic and components surrounding a zip input box and its error
// messaging, the api school search filtered on zip, and the school dropdown
// that search populates.
export default function SchoolZipSearch({fieldNames}) {
  const detectedSchoolId = sessionStorage.getItem(SCHOOL_ID_SESSION_KEY);
  const detectedZip = sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY);
  const [selectedSchoolNcesId, setSelectedSchoolNcesId] = useState(
    detectedSchoolId || SELECT_A_SCHOOL
  );
  const [inputManually, setInputManually] = useState(false);
  const [dropdownSchools, setDropdownSchools] = useState([]);
  const [zip, setZip] = useState(detectedZip || '');
  const [isSchoolDropdownDisabled, setIsSchoolDropdownDisabled] = useState(
    !detectedZip
  );

  const labelClassName = isSchoolDropdownDisabled ? style.disabledLabel : '';

  useEffect(() => {
    const isValidZip = ZIP_REGEX.test(zip);
    if (isValidZip) {
      if (zip !== sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY)) {
        // Clear out school from dropdown if zip has changed
        setSelectedSchoolNcesId(SELECT_A_SCHOOL);
      }
      sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, zip);
      const searchUrl = `/dashboardapi/v1/schoolzipsearch/${zip}`;
      fetch(searchUrl, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
        .then(response => (response.ok ? response.json() : []))
        .then(json => {
          const schools = json.map(school => constructSchoolOption(school));
          setDropdownSchools(schools);
        })
        .catch(error => {
          console.log(
            'There was a problem with the fetch operation:',
            error.message
          );
        });
      setIsSchoolDropdownDisabled(false);
      analyticsReporter.sendEvent(
        EVENTS.ZIP_CODE_ENTERED,
        {zip: zip},
        PLATFORMS.BOTH
      );
    } else {
      setIsSchoolDropdownDisabled(true);
    }
  }, [zip]);

  useEffect(() => {
    sessionStorage.setItem(SCHOOL_ID_SESSION_KEY, selectedSchoolNcesId);
  }, [selectedSchoolNcesId]);

  const sendAnalyticsEvent = (eventName, data) => {
    analyticsReporter.sendEvent(eventName, data, PLATFORMS.BOTH);
  };

  const onSchoolChange = e => {
    const schoolId = e.target.value;
    if (schoolId === NO_SCHOOL_SETTING) {
      sendAnalyticsEvent(EVENTS.DO_NOT_TEACH_AT_SCHOOL_CLICKED, {});
    } else if (schoolId === CLICK_TO_ADD) {
      setInputManually(true);
      sendAnalyticsEvent(EVENTS.ADD_MANUALLY_CLICKED, {});
    } else {
      sendAnalyticsEvent(EVENTS.SCHOOL_SELECTED_FROM_LIST, {
        'nces Id': schoolId,
      });
    }
    setSelectedSchoolNcesId(schoolId);
  };

  const constructSchoolOption = school => ({
    value: school.nces_id.toString(),
    text: `${school.name}`,
  });

  const sortSchoolsByName = schools => {
    const sortedSchools = schools.sort((a, b) => {
      if (a.text < b.text) {
        return -1;
      }
    });
    return sortedSchools;
  };

  const SORTED_SCHOOLS_OPTION_GROUP = [
    {value: SELECT_A_SCHOOL, text: i18n.selectASchool()},
  ].concat(sortSchoolsByName(dropdownSchools));

  return (
    <div className={style.inputContainer}>
      <label>
        <TextField
          id="uitest-school-zip"
          name={fieldNames.schoolZip}
          label={i18n.enterYourSchoolZip()}
          onChange={e => {
            setZip(e.target.value);
          }}
          value={zip}
          placeholder="00000"
        />
        {zip && isSchoolDropdownDisabled && (
          <BodyThreeText className={style.errorMessage}>
            {i18n.zipInvalidMessage()}
          </BodyThreeText>
        )}
      </label>
      {!inputManually && (
        <div>
          <SimpleDropdown
            id="uitest-school-dropdown"
            disabled={isSchoolDropdownDisabled}
            name={fieldNames.ncesSchoolId}
            className={labelClassName}
            labelText={i18n.selectYourSchool()}
            itemGroups={[
              {
                label: i18n.schools(),
                groupItems: SORTED_SCHOOLS_OPTION_GROUP,
              },
              {
                label: i18n.additionalOptions(),
                groupItems: SEARCH_DEFAULTS,
              },
            ]}
            selectedValue={selectedSchoolNcesId}
            onChange={onSchoolChange}
            size="m"
          />
          <Button
            text={i18n.noSchoolSetting()}
            disabled={isSchoolDropdownDisabled}
            color={'purple'}
            type={'tertiary'}
            size={'xs'}
            onClick={e => {
              e.preventDefault();
              setSelectedSchoolNcesId(NO_SCHOOL_SETTING);
              sendAnalyticsEvent(EVENTS.DO_NOT_TEACH_AT_SCHOOL_CLICKED, {});
            }}
          />
        </div>
      )}
      {inputManually && (
        <div>
          <SchoolNameInput fieldNames={{schoolName: fieldNames.schoolName}} />
          <Button
            text={i18n.returnToResults()}
            color={'purple'}
            type={'tertiary'}
            size={'xs'}
            onClick={() => {
              setInputManually(false);
              setSelectedSchoolNcesId(SELECT_A_SCHOOL);
            }}
          />
        </div>
      )}
    </div>
  );
}

SchoolZipSearch.propTypes = {
  fieldNames: PropTypes.object,
};

import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import classNames from 'classnames';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import {Button} from '@cdo/apps/componentLibrary/button';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

export const SELECT_A_SCHOOL = 'selectASchool';
export const CLICK_TO_ADD = 'clickToAdd';
export const NO_SCHOOL_SETTING = 'noSchoolSetting';
const SEARCH_DEFAULTS = [
  {value: CLICK_TO_ADD, text: i18n.schoolClickToAdd()},
  {value: NO_SCHOOL_SETTING, text: i18n.noSchoolSetting()},
];

export default function SchoolZipSearch({fieldNames, zip, disabled}) {
  const [selectedSchoolNcesId, setSelectedSchoolNcesId] =
    useState(SELECT_A_SCHOOL);
  const [inputManually, setInputManually] = useState(false);
  const [dropdownSchools, setDropdownSchools] = useState([]);

  useEffect(() => {
    if (!disabled) {
      setSelectedSchoolNcesId(SELECT_A_SCHOOL);
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
    }
  }, [zip, disabled]);

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

  const labelClassName = disabled
    ? classNames(style.padding, style.disabledLabel)
    : style.padding;

  const SORTED_SCHOOLS_OPTION_GROUP = [
    {value: SELECT_A_SCHOOL, text: i18n.selectASchool()},
  ].concat(sortSchoolsByName(dropdownSchools));

  return (
    <div>
      {!inputManually && (
        <div>
          <BodyTwoText
            className={labelClassName}
            visualAppearance={'heading-xs'}
          >
            {i18n.selectYourSchool()}
          </BodyTwoText>
          <SimpleDropdown
            id="uitest-school-dropdown"
            disabled={disabled}
            name={fieldNames.ncesSchoolId}
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
            disabled={disabled}
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
  zip: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

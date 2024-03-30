import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import Button from '@cdo/apps/templates/Button';

const SEARCH_DEFAULTS = [
  {value: 'selectASchool', text: i18n.selectASchool()},
  {value: 'clickToAdd', text: i18n.schoolClickToAdd()},
  {value: 'noSchoolSetting', text: i18n.noSchoolSetting()},
];

export default function SchoolZipSearch({fieldNames, zip}) {
  const [selectedSchoolNcesId, setSelectedSchoolNcesId] = useState('');
  const [inputManually, setInputManually] = useState(false);
  const [dropdownSchools, setDropdownSchools] = useState([]);

  useEffect(() => {
    const searchUrl = `/dashboardapi/v1/schoolsearch/${zip}/40`;
    fetch(searchUrl, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
      .then(response => (response.ok ? response.json() : []))
      .then(json => {
        const schools = json.map(school => constructSchoolOption(school));
        setDropdownSchools(schools);
      });
  }, [zip]);

  const onSchoolChange = e => {
    const schoolId = e.target.value;
    setSelectedSchoolNcesId(schoolId);
    if (schoolId === 'clickToAdd') {
      setInputManually(true);
    }
  };

  const constructSchoolOption = school => ({
    value: school.nces_id.toString(),
    text: `${school.name}`,
  });

  return (
    <div>
      {!inputManually && (
        <div>
          <BodyTwoText
            className={style.padding}
            visualAppearance={'heading-xs'}
          >
            {i18n.selectYourSchool()}
          </BodyTwoText>
          <SimpleDropdown
            className={style.dropdown}
            name={fieldNames.ncesSchoolId}
            items={SEARCH_DEFAULTS.concat(dropdownSchools)}
            selectedValue={selectedSchoolNcesId}
            onChange={onSchoolChange}
            size="m"
          />
        </div>
      )}
      {inputManually && (
        <div>
          <SchoolNameInput fieldNames={{schoolName: fieldNames.schoolName}} />
          <Button
            text={i18n.returnToResults()}
            styleAsText={true}
            onClick={() => {
              setInputManually(false);
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
};

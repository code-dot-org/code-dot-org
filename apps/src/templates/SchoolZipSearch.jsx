import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import Button from '@cdo/apps/templates/Button';

const SEARCH_ITEMS = [
  {value: 'selectASchool', text: i18n.selectASchool()},
  {value: 'clickToAdd', text: i18n.schoolClickToAdd()},
  {value: 'noSchoolSetting', text: i18n.noSchoolSetting()},
];

export default function SchoolZipSearch({fieldNames}) {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [inputManually, setInputManually] = useState(false);

  const onSchoolChange = e => {
    const schoolName = e.target.value;
    setSelectedSchool(schoolName);
    if (schoolName === 'clickToAdd') {
      setInputManually(true);
    }
  };

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
            name={fieldNames.schoolName}
            items={SEARCH_ITEMS}
            selectedValue={selectedSchool}
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
};

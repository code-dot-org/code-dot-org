import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import i18n from '@cdo/locale';
import * as utils from '@cdo/apps/utils';
import {
  setSortByFamilyName,
  isSortedByFamilyName,
} from '@cdo/apps/templates/currentUserRedux';

const SORT_BY_FAMILY_NAME = 'sortByFamilyName';

function SortByNameDropdown() {
  return (
    <div>
      <Select
        id="familyNameSort"
        value={isSortedByFamilyName ? i18n.familyName() : i18n.displayName()}
        onChange={e => {
          setSortByFamilyName(e.value);
          utils.trySetLocalStorage(SORT_BY_FAMILY_NAME, e.value);
        }}
        clearable={false}
        options={
          ({value: true, label: i18n.FamilyName()},
          {value: false, label: i18n.DisplayName()})
        }
      />
    </div>
  );
}

SortByNameDropdown.propTypes = {
  setSortByFamilyName: PropTypes.func.isRequired,
  isSortedByFamilyName: PropTypes.bool.isRequired,
};

export default SortByNameDropdown;

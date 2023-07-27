import {getStore} from '@cdo/apps/redux';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import * as utils from '@cdo/apps/utils';
import {
  setSortByFamilyName,
  isSortedByFamilyName,
} from '@cdo/apps/templates/currentUserRedux';

const SORT_BY_FAMILY_NAME = 'sortByFamilyName';

function SortByNameDropdown({sortByStyles, selectStyles}) {
  return (
    <div style={sortByStyles}>
      {i18n.sortBy()}
      <select
        name="familyNameSort"
        style={selectStyles}
        value={isSortedByFamilyName ? i18n.familyName() : i18n.displayName()}
        onChange={e => {
          getStore().dispatch(setSortByFamilyName(e.value));
          utils.trySetLocalStorage(SORT_BY_FAMILY_NAME, e.value);
        }}
      >
        <option key={i18n.familyName()} value={true}>
          {i18n.familyName()}
        </option>
        <option key={i18n.displayName()} value={false}>
          {i18n.displayName()}
        </option>
      </select>
    </div>
  );
}

SortByNameDropdown.propTypes = {
  sortByStyles: PropTypes.object,
  selectStyles: PropTypes.object,
};

export default SortByNameDropdown;

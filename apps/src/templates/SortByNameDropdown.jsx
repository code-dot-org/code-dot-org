import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {setSortByFamilyName} from '@cdo/apps/templates/currentUserRedux';

function SortByNameDropdown({sortByStyles, selectStyles}) {
  const dispatch = useDispatch();
  return (
    <div>
      <div style={sortByStyles}>{i18n.sortBy()}</div>
      <select
        name="familyNameSort"
        style={selectStyles}
        defaultValue={i18n.displayName}
        onChange={e => {
          dispatch(setSortByFamilyName(e.target.value));
        }}
      >
        <option value={false}>{i18n.displayName()}</option>
        <option value={true}>{i18n.familyName()}</option>
      </select>
    </div>
  );
}

SortByNameDropdown.propTypes = {
  sortByStyles: PropTypes.object,
  selectStyles: PropTypes.object,
};

export default SortByNameDropdown;

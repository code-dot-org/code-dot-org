import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {setSortByFamilyName} from '@cdo/apps/templates/currentUserRedux';

const DROPDOWN_COMPONENT = 'DropdownComponent';

function SortByNameDropdown({sortByStyles, selectStyles, sectionId, unitName}) {
  const dispatch = useDispatch();
  return (
    <div>
      <div style={sortByStyles}>{i18n.sortBy()}</div>
      <select
        name="familyNameSort"
        style={selectStyles}
        defaultValue={i18n.displayName}
        onChange={e => {
          dispatch(
            setSortByFamilyName(
              e.target.value,
              sectionId,
              unitName,
              DROPDOWN_COMPONENT
            )
          );
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
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
};

export default SortByNameDropdown;

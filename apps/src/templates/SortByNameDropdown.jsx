import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {setSortByFamilyName} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';

function SortByNameDropdown({
  sortByStyles,
  selectStyles,
  sectionId,
  unitName,
  source,
}) {
  const dispatch = useDispatch();
  const sortByFamilyName = useSelector(
    state => state.currentUser.isSortedByFamilyName
  );

  return (
    <div>
      <div style={sortByStyles}>{i18n.sortBy()}</div>
      <select
        name="familyNameSort"
        aria-label={i18n.sortBy()}
        style={selectStyles}
        value={sortByFamilyName}
        onChange={e => {
          dispatch(
            setSortByFamilyName(
              e.target.value === 'true',
              sectionId,
              unitName,
              source
            )
          );
          new UserPreferences().setSortByFamilyName(e.target.value === 'true');
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
  source: PropTypes.string,
};

export default SortByNameDropdown;

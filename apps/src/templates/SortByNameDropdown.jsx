import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import i18n from '@cdo/locale';
import {setSortByFamilyName} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';

const FAMILY_NAME = 'familyName';
const DISPLAY_NAME = 'displayName';

function SortByNameDropdown({
  labelClassName,
  selectClassName,
  labelStyles,
  selectStyles,
  sectionId,
  unitName,
  source,
  isSortedByFamilyName,
  setSortByFamilyName,
}) {
  const onSortByFamilyNameChange = useCallback(
    e => {
      const newSort = e.target.value === FAMILY_NAME;
      new UserPreferences().setSortByFamilyName(newSort);
      setSortByFamilyName(newSort, sectionId, unitName, source);
    },
    [sectionId, unitName, source, setSortByFamilyName]
  );

  const selectedValue = isSortedByFamilyName ? FAMILY_NAME : DISPLAY_NAME;
  return (
    <div>
      <div style={labelStyles} className={labelClassName}>
        {i18n.sortBy()}
      </div>
      <select
        name="familyNameSort"
        aria-label={i18n.sortBy()}
        style={selectStyles}
        className={selectClassName}
        value={selectedValue}
        onChange={onSortByFamilyNameChange}
      >
        <option value={DISPLAY_NAME}>{i18n.displayName()}</option>
        <option value={FAMILY_NAME}>{i18n.familyName()}</option>
      </select>
    </div>
  );
}

SortByNameDropdown.propTypes = {
  labelClassName: PropTypes.string,
  selectClassName: PropTypes.string,
  labelStyles: PropTypes.object,
  selectStyles: PropTypes.object,
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
  source: PropTypes.string,
  isSortedByFamilyName: PropTypes.bool,
  setSortByFamilyName: PropTypes.func,
};

export const UnconnectedSortByNameDropdown = SortByNameDropdown;

export default connect(
  state => ({isSortedByFamilyName: state.currentUser.isSortedByFamilyName}),
  dispatch => ({
    setSortByFamilyName: (sortByFamilyName, sectionId, unitName, source) =>
      dispatch(
        setSortByFamilyName(sortByFamilyName, sectionId, unitName, source)
      ),
  })
)(SortByNameDropdown);

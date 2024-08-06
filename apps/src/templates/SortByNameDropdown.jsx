import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {connect} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {setSortByFamilyName} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '@cdo/apps/util/UserPreferences';
import i18n from '@cdo/locale';

const FAMILY_NAME = 'familyName';
const DISPLAY_NAME = 'displayName';

function SortByNameDropdown({
  sectionId,
  unitName,
  source,
  isSortedByFamilyName,
  setSortByFamilyName,
  className,
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
    <SimpleDropdown
      items={[
        {value: DISPLAY_NAME, text: i18n.displayName()},
        {value: FAMILY_NAME, text: i18n.familyName()},
      ]}
      selectedValue={selectedValue}
      name="familyNameSort"
      onChange={onSortByFamilyNameChange}
      labelText={i18n.sortBy()}
      className={className}
      size="s"
      dropdownTextThickness="thin"
      color="gray"
    />
  );
}

SortByNameDropdown.propTypes = {
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
  source: PropTypes.string,
  isSortedByFamilyName: PropTypes.bool,
  setSortByFamilyName: PropTypes.func,
  className: PropTypes.string,
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

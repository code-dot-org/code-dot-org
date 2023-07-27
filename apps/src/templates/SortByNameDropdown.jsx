import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import * as utils from '@cdo/apps/utils';
import {setSortByFamilyName} from '@cdo/apps/templates/currentUserRedux';
import ReactTooltip from 'react-tooltip';

const SORT_BY_FAMILY_NAME = 'sortByFamilyName';

function SortByNameDropdown({sortByStyles, selectStyles}) {
  const dispatch = useDispatch();
  const isSortedByFamilyName = useSelector(store => store.isSortedByFamilyName);
  return (
    <div>
      <div data-for="sort-by" data-tip>
        <span>
          <span style={sortByStyles}> {i18n.sortBy()}</span>
          <ReactTooltip id="sort-by" role="tooltip" effect="solid">
            <div>{i18n.familyNameToolTip()}</div>
          </ReactTooltip>
        </span>
      </div>
      <select
        name="familyNameSort"
        style={selectStyles}
        value={isSortedByFamilyName ? i18n.familyName() : i18n.displayName()}
        onChange={e => {
          dispatch(setSortByFamilyName(e.value));
          utils.trySetLocalStorage(SORT_BY_FAMILY_NAME, e.value);
        }}
      >
        <option key={i18n.familyName()} value={'true'}>
          {i18n.familyName()}
        </option>
        <option key={i18n.displayName()} value={'false'}>
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

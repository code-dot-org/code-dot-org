import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Select from 'react-select';
import i18n from '@cdo/locale';

export const NameSortColumns = [i18n.displayName, i18n.familyName];

function SortByNameDropdown({onChangeSort}) {
  const [selectedSort, setSelectedSort] = useState(NameSortColumns[0]);
  return (
    <div>
      <Select
        id="familyNameSort"
        value={selectedSort}
        onChange={e => {
          onChangeSort(e.value);
          setSelectedSort(e.value);
        }}
        placeholder="-"
        clearable={false}
        options={NameSortColumns}
      />
    </div>
  );
}

SortByNameDropdown.propTypes = {
  onChangeSort: PropTypes.func.isRequired,
};

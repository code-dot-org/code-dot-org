import PropTypes from 'prop-types';
import React from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import i18n from '@cdo/locale';

const SubLevelDropdown = ({subLevels, handleChange}) => {
  const subLevelNums = Array.from(
    {length: subLevels.length},
    (_, index) => index
  );
  return (
    <SimpleDropdown
      items={subLevelNums.map(subLevel => ({
        value: subLevel,
        text: i18n.question() + ': ' + (subLevel + 1),
      }))}
      onChange={handleChange}
    />
  );
};

SubLevelDropdown.propTypes = {
  subLevels: PropTypes.array,
  handleChange: PropTypes.func,
};

export default SubLevelDropdown;

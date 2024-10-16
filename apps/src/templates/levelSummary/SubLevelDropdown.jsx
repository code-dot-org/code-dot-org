import PropTypes from 'prop-types';
import React from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import i18n from '@cdo/locale';

const SubLevelDropdown = ({subLevels, handleChange}) => {
  return (
    <SimpleDropdown
      items={subLevels.map((_, index) => ({
        value: index,
        text: i18n.question() + ': ' + (index + 1),
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

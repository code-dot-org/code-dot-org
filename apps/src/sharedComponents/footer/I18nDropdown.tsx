import React from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';
import currentLocale from '@cdo/apps/util/currentLocale';

interface I18nDropdownProps {
  localeUrl: string;
  optionsForLocaleSelect: SimpleDropdownProps['items'];
}

const I18nDropdown: React.FC<I18nDropdownProps> = ({
  localeUrl,
  optionsForLocaleSelect,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Automatically submit the form when the dropdown value changes
    event.target.form?.submit();
  };

  return (
    <form
      action={localeUrl}
      method="post"
      id="localeForm"
      style={{marginBottom: '0px'}}
    >
      <input type="hidden" name="user_return_to" value={window.location.href} />
      <SimpleDropdown
        dropdownTextThickness="thin"
        name="locale"
        selectedValue={currentLocale()}
        onChange={handleChange}
        items={optionsForLocaleSelect}
        labelText="Select Language"
        isLabelVisible={false}
        size="xs"
        color="gray"
      />
    </form>
  );
};

export default I18nDropdown;

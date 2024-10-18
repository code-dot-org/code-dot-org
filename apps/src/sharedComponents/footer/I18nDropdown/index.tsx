import React from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';
import currentLocale from '@cdo/apps/util/currentLocale';

import './style.scss';

interface I18nDropdownProps {
  localeUrl: string;
  selectedLocale?: string;
  optionsForLocaleSelect: SimpleDropdownProps['items'];
}

const I18nDropdown: React.FC<I18nDropdownProps> = ({
  localeUrl,
  selectedLocale = '',
  optionsForLocaleSelect,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
        id="locale"
        className="languageSelect"
        name="locale"
        selectedValue={selectedLocale || currentLocale()}
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

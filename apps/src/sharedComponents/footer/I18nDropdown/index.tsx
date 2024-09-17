import React from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';
import currentLocale from '@cdo/apps/util/currentLocale';

import './style.scss';

interface I18nDropdownProps {
  localeUrl: string;
  optionsForLocaleSelect: SimpleDropdownProps['items'];
}

const I18nDropdown: React.FC<I18nDropdownProps> = ({
  localeUrl,
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
      <div style={{display: 'flex', alignItems: 'center'}}>
        <SimpleDropdown
          className="languageSelect"
          name="locale-dropdown"
          selectedValue={currentLocale()}
          onChange={handleChange}
          items={optionsForLocaleSelect}
          labelText="Select Language"
          isLabelVisible={false}
          size="xs"
          color="gray"
        />
      </div>
    </form>
  );
};

export default I18nDropdown;

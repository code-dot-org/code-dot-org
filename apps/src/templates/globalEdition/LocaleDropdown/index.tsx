import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useRef, useState} from 'react';

import moduleStyles from './localeDropdown.module.scss';

export interface Locale {
  /** The name of the locale */
  text: string;
  /** The language code */
  value: string;
}

export interface LocaleDropdownProps {
  options: Locale[];
  initialLocale: string;
  url: string;
  csrfToken: string;
}

/**
 * This gives a dropdown to display the set of regions available to the site.
 */
const LocaleDropdown: React.FunctionComponent<LocaleDropdownProps> = ({
  options,
  initialLocale,
  url,
  csrfToken,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(initialLocale);
  const ref = useRef<HTMLFormElement | null>(null);

  return (
    <form
      action={url}
      method="post"
      acceptCharset="UTF-8"
      data-notranslate
      ref={ref}
      className={moduleStyles.form}
    >
      <FontAwesomeV6Icon iconName="language" iconStyle="solid" />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <SimpleDropdown
        className={moduleStyles.localeDropdown}
        size="s"
        name="locale"
        isLabelVisible={false}
        labelText={selectedOption}
        selectedValue={selectedOption}
        items={options}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          setSelectedOption(event.target.value);
          if (ref.current) {
            ref.current.submit();
          }
        }}
      />
    </form>
  );
};

export default LocaleDropdown;

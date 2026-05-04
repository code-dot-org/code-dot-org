import {FormControl, InputLabel, NativeSelect, Skeleton} from '@mui/material';
import {styled} from '@mui/material/styles';
import {visuallyHidden} from '@mui/utils';

import type {FooterLanguageOption} from './Footer.types';

// ---------------------------------------------------------------------------
// Slot wrapper
// ---------------------------------------------------------------------------

const FooterLocaleSelect = styled('div', {
  name: 'MuiFooter',
  slot: 'localeSelect',
})({});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCALE_SELECT_ID = 'footer-locale-select';

// ---------------------------------------------------------------------------
// FooterLocalePicker
// ---------------------------------------------------------------------------

interface FooterLocalePickerProps {
  languages: FooterLanguageOption[] | 'loading';
  selectedLocaleCode: string;
  onLanguageChange: (code: string) => void;
}

/**
 * Language picker: renders a populated NativeSelect when languages are ready,
 * or a skeleton placeholder while they load.
 *
 * @param props - {@link FooterLocalePickerProps}
 */
const FooterLocalePicker = ({
  languages,
  selectedLocaleCode,
  onLanguageChange,
}: FooterLocalePickerProps) => {
  if (languages === 'loading') {
    return (
      <FooterLocaleSelect>
        <Skeleton
          variant="rectangular"
          width="8.5rem"
          height="1.5rem"
          role="status"
          aria-label="Loading language options"
        />
      </FooterLocaleSelect>
    );
  }

  return (
    <FooterLocaleSelect>
      <FormControl>
        <InputLabel htmlFor={LOCALE_SELECT_ID} sx={visuallyHidden}>
          Language
        </InputLabel>
        <NativeSelect
          value={selectedLocaleCode}
          onChange={e => onLanguageChange(e.target.value)}
          inputProps={{id: LOCALE_SELECT_ID}}
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.text}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
    </FooterLocaleSelect>
  );
};

export default FooterLocalePicker;

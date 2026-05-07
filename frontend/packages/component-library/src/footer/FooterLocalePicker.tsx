import {Skeleton} from '@mui/material';
import {styled} from '@mui/material/styles';

import {SimpleDropdown} from '@/dropdown';

import type {FooterLanguageOption} from './Footer.types';

// ---------------------------------------------------------------------------
// Slot wrapper
// ---------------------------------------------------------------------------

const FooterLocaleSelect = styled('div', {
  name: 'MuiFooter',
  slot: 'localeSelect',
})({});

// ---------------------------------------------------------------------------
// FooterLocalePicker
// ---------------------------------------------------------------------------

interface FooterLocalePickerProps {
  languages: FooterLanguageOption[] | 'loading';
  selectedLocaleCode: string;
  onLanguageChange: (code: string) => void;
}

/**
 * Language picker: renders a SimpleDropdown when languages are ready,
 * or a skeleton placeholder while they load. SimpleDropdown is the DSCO
 * dropdown primitive — DSCO is the design-system home for Dropdowns
 * (no MUI replacement exists yet, per MIGRATION_STATUS.md).
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
      <SimpleDropdown
        name="footer-locale"
        labelText="Language"
        isLabelVisible={false}
        items={languages}
        selectedValue={selectedLocaleCode}
        onChange={e => onLanguageChange(e.target.value)}
        color="white"
        size="s"
      />
    </FooterLocaleSelect>
  );
};

export default FooterLocalePicker;

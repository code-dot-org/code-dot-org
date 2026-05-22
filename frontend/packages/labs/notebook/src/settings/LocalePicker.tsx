/**
 * LocalePicker — locale selector for the settings page.
 *
 * Renders a MUI Select listing all four supported locales. Each option
 * displays the native name followed by the English name in parentheses,
 * e.g. "日本語 (Japanese)". Calls onLocaleChange when the user selects
 * a different entry.
 */

import {Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import type {SelectChangeEvent} from '@mui/material';
import {type SupportedLocale, LOCALE_META} from '../i18n/localeMeta';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Ordered locale list — determines the render order in the dropdown. */
const LOCALE_ORDER: SupportedLocale[] = ['en-US', 'ja-JP', 'hi-IN', 'fa-IR'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for {@link LocalePicker}.
 */
export interface LocalePickerProps {
  /** Currently active locale. */
  locale: SupportedLocale;
  /**
   * Called with the newly selected locale when the user picks a different entry.
   * @param l New locale tag
   */
  onLocaleChange: (l: SupportedLocale) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dropdown selector that lets the user switch the active UI locale.
 * Each option shows `nativeName (englishName)` so both script-literate
 * and non-script-literate readers can identify their language.
 *
 * @param props.locale Active locale tag.
 * @param props.onLocaleChange Callback invoked on locale change.
 */
export function LocalePicker({locale, onLocaleChange}: LocalePickerProps): React.ReactElement {
  /**
   * Handles MUI Select's onChange event.
   * Casts the string value to SupportedLocale — safe because options are
   * built exclusively from LOCALE_ORDER which contains only valid tags.
   * @param event MUI SelectChangeEvent carrying the chosen locale tag
   */
  function handleChange(event: SelectChangeEvent<string>): void {
    onLocaleChange(event.target.value as SupportedLocale);
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="locale-picker-label">Language</InputLabel>
      <Select
        labelId="locale-picker-label"
        label="Language"
        value={locale}
        onChange={handleChange}
      >
        {LOCALE_ORDER.map(l => {
          const meta = LOCALE_META[l];
          return (
            <MenuItem key={l} value={l}>
              {meta.nativeName} ({meta.englishName})
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

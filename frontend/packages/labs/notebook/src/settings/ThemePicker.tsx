/**
 * ThemePicker — light/dark theme toggle for the settings page.
 *
 * Renders a MUI ToggleButtonGroup with two options: Light and Dark.
 * Dark is the default per spec.  Calls onThemeChange when the user
 * selects the other value.
 */

import {ToggleButtonGroup, ToggleButton} from '@mui/material';
import type {LabTheme} from '../theme/index';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for {@link ThemePicker}.
 */
export interface ThemePickerProps {
  /** Currently active theme. */
  theme: LabTheme;
  /**
   * Called with the newly selected theme when the user toggles.
   * @param t New theme value
   */
  onThemeChange: (t: LabTheme) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Toggle-button pair that lets the user switch between the light and dark
 * visual themes.  The active theme button is highlighted via MUI's default
 * selected styling.
 *
 * @param props.theme Active theme.
 * @param props.onThemeChange Callback invoked on theme change.
 */
export function ThemePicker({theme, onThemeChange}: ThemePickerProps): React.ReactElement {
  /**
   * Handles MUI ToggleButtonGroup onChange.
   * Ignores null values (deselecting the only active button is disallowed by
   * the `exclusive` prop, but MUI types permit null in the callback).
   * @param _evt Unused synthetic event
   * @param newTheme The theme string from the clicked button, or null
   */
  function handleChange(_evt: React.MouseEvent<HTMLElement>, newTheme: LabTheme | null): void {
    if (newTheme !== null) {
      onThemeChange(newTheme);
    }
  }

  return (
    <ToggleButtonGroup
      value={theme}
      exclusive
      onChange={handleChange}
      aria-label="Theme"
      size="small"
    >
      <ToggleButton value="light" aria-label="Light theme">
        Light
      </ToggleButton>
      <ToggleButton value="dark" aria-label="Dark theme">
        Dark
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

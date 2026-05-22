/**
 * AccessibilityPanel — toggles for display and reading-comfort preferences.
 *
 * Renders four labelled Switch controls:
 *   - Read aloud: passes text to the Web Speech API (stub in T157)
 *   - OpenDyslexic font: swaps the body typeface (stub in T156)
 *   - Increased line spacing: adds vertical breathing room (stub in T158)
 *   - Focus mode: dims non-active cells (stub in T158)
 *
 * No persistence is applied at this layer; callers own the boolean state and
 * pass it down as controlled props.  Effects (font swapping, CSS custom
 * property writes) are wired in the sibling stubs T156-T158.
 */

import {FormControlLabel, Stack, Switch, Typography} from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for AccessibilityPanel. */
export interface AccessibilityPanelProps {
  /** Whether the read-aloud feature is currently enabled. */
  readAloud: boolean;
  /**
   * Called when the read-aloud toggle changes.
   * @param enabled New value of the toggle
   */
  onReadAloudChange: (enabled: boolean) => void;

  /** Whether the OpenDyslexic typeface is currently active. */
  openDyslexicFont: boolean;
  /**
   * Called when the font toggle changes.
   * @param enabled New value of the toggle
   */
  onFontChange: (enabled: boolean) => void;

  /** Whether increased line spacing is currently active. */
  increasedLineSpacing: boolean;
  /**
   * Called when the line-spacing toggle changes.
   * @param enabled New value of the toggle
   */
  onLineSpacingChange: (enabled: boolean) => void;

  /** Whether focus mode (dim inactive cells) is currently active. */
  focusMode: boolean;
  /**
   * Called when the focus-mode toggle changes.
   * @param enabled New value of the toggle
   */
  onFocusModeChange: (enabled: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Props for LabelledSwitch. */
interface LabelledSwitchProps {
  /** Visible label for the switch row. */
  label: string;
  /** Current checked state. */
  checked: boolean;
  /**
   * Called on toggle.
   * @param enabled New checked state
   */
  onChange: (enabled: boolean) => void;
}

/**
 * A FormControlLabel wrapping a Switch, wired to a boolean onChange callback.
 * Keeps JSX markup in AccessibilityPanel free of inline logic.
 */
function LabelledSwitch({
  label,
  checked,
  onChange,
}: LabelledSwitchProps): React.ReactElement {
  /** Bridges the native event to the typed boolean callback. */
  function handleChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    onChange(evt.target.checked);
  }

  return (
    <FormControlLabel
      control={<Switch checked={checked} onChange={handleChange} />}
      label={<Typography variant="body2">{label}</Typography>}
      labelPlacement="end"
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Vertical stack of accessibility preference toggles.
 * All state is controlled; no persistence or side-effects at this layer.
 */
export function AccessibilityPanel({
  readAloud,
  onReadAloudChange,
  openDyslexicFont,
  onFontChange,
  increasedLineSpacing,
  onLineSpacingChange,
  focusMode,
  onFocusModeChange,
}: AccessibilityPanelProps): React.ReactElement {
  return (
    <Stack spacing={1}>
      <LabelledSwitch
        label="Read aloud"
        checked={readAloud}
        onChange={onReadAloudChange}
      />
      <LabelledSwitch
        label="OpenDyslexic font"
        checked={openDyslexicFont}
        onChange={onFontChange}
      />
      <LabelledSwitch
        label="Increased line spacing"
        checked={increasedLineSpacing}
        onChange={onLineSpacingChange}
      />
      <LabelledSwitch
        label="Focus mode"
        checked={focusMode}
        onChange={onFocusModeChange}
      />
    </Stack>
  );
}

/**
 * Parameter controls widget for notebook code cells.
 *
 * Renders one labelled UI control per `#@param`-annotated parameter in the
 * cell source.  When any control changes it rewrites the corresponding source
 * line via `updateParameterInSource` and propagates the updated source array
 * upward through `onSourceChange`.
 *
 * Four control kinds are supported:
 *   - value   → MUI TextField (free text)
 *   - slider  → MUI Slider with numeric bounds from config
 *   - dropdown→ MUI Select + MenuItem per option
 *   - boolean → MUI Switch
 */

import { useCallback } from 'react';
import {
  Box,
  MenuItem,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Parameter } from './parameterTypes';
import { updateParameterInSource } from './parameterParser';
import { derivePrompt } from './promptFallback';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for ParameterControls. */
export interface ParameterControlsProps {
  /** Parsed parameters to render as labelled controls. */
  parameters: Parameter[];
  /**
   * Called when any control changes.  Receives the full updated source line
   * array so the parent can persist it.
   */
  onSourceChange: (updatedSource: string[]) => void;
  /** Current cell source lines required to compute the in-place rewrite. */
  source: string[];
}

// ---------------------------------------------------------------------------
// Per-kind control renderers
// ---------------------------------------------------------------------------

/** Props shared by every single-parameter control sub-component. */
interface ControlProps {
  /** The parameter this control represents. */
  parameter: Parameter;
  /** Current cell source needed for the rewrite call. */
  source: string[];
  /** Propagates updated source after any value change. */
  onSourceChange: (updatedSource: string[]) => void;
}

/**
 * Text field control for `value`-kind parameters.
 */
function ValueControl({ parameter, source, onSourceChange }: ControlProps): React.ReactElement {
  const label = parameter.prompt ?? derivePrompt(parameter.name);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const updated = updateParameterInSource(source, parameter, e.target.value);
      onSourceChange(updated);
    },
    [parameter, source, onSourceChange]
  );

  return (
    <TextField
      size="small"
      label={label}
      value={parameter.value ?? ''}
      onChange={handleChange}
      fullWidth
    />
  );
}

/**
 * Slider control for `slider`-kind parameters.
 */
function SliderControl({ parameter, source, onSourceChange }: ControlProps): React.ReactElement {
  const label = parameter.prompt ?? derivePrompt(parameter.name);
  const min = parameter.config.min ?? 0;
  const max = parameter.config.max ?? 100;
  const step = parameter.config.step ?? 1;

  const handleChange = useCallback(
    (_event: Event, value: number | number[]): void => {
      const scalar = Array.isArray(value) ? value[0] : value;
      const updated = updateParameterInSource(source, parameter, scalar);
      onSourceChange(updated);
    },
    [parameter, source, onSourceChange]
  );

  return (
    <Box>
      <Typography variant="caption">{label}</Typography>
      <Slider
        value={typeof parameter.value === 'number' ? parameter.value : min}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        valueLabelDisplay="auto"
        size="small"
      />
    </Box>
  );
}

/**
 * Select / dropdown control for `dropdown`-kind parameters.
 */
function DropdownControl({ parameter, source, onSourceChange }: ControlProps): React.ReactElement {
  const label = parameter.prompt ?? derivePrompt(parameter.name);
  const options = parameter.config.options ?? [];

  const handleChange = useCallback(
    (e: SelectChangeEvent<string>): void => {
      const updated = updateParameterInSource(source, parameter, e.target.value);
      onSourceChange(updated);
    },
    [parameter, source, onSourceChange]
  );

  return (
    <Box>
      <Typography variant="caption">{label}</Typography>
      <Select
        value={typeof parameter.value === 'string' ? parameter.value : ''}
        onChange={handleChange}
        size="small"
        fullWidth
      >
        {options.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

/**
 * Switch / toggle control for `boolean`-kind parameters.
 */
function BooleanControl({ parameter, source, onSourceChange }: ControlProps): React.ReactElement {
  const label = parameter.prompt ?? derivePrompt(parameter.name);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const updated = updateParameterInSource(source, parameter, e.target.checked);
      onSourceChange(updated);
    },
    [parameter, source, onSourceChange]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Switch
        checked={parameter.value === true}
        onChange={handleChange}
        size="small"
      />
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Dispatch helper
// ---------------------------------------------------------------------------

/**
 * Selects and renders the appropriate control component for a single parameter.
 *
 * @param parameter - The parameter whose `type` field selects the control kind.
 * @param source - Current source lines for rewrite computation.
 * @param onSourceChange - Propagates the updated source after a value change.
 * @returns The rendered control element.
 */
function renderControl(
  parameter: Parameter,
  source: string[],
  onSourceChange: (updatedSource: string[]) => void
): React.ReactElement {
  const sharedProps: ControlProps = { parameter, source, onSourceChange };

  switch (parameter.type) {
    case 'slider':
      return <SliderControl {...sharedProps} />;
    case 'dropdown':
      return <DropdownControl {...sharedProps} />;
    case 'boolean':
      return <BooleanControl {...sharedProps} />;
    case 'value':
    default:
      return <ValueControl {...sharedProps} />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders one labelled control for every parameter in the list.
 *
 * Controls are stacked vertically with bottom margin between them.  The
 * component is purely controlled: it holds no local value state and relies on
 * `onSourceChange` to propagate changes back to the cell.
 */
export function ParameterControls({
  parameters,
  onSourceChange,
  source,
}: ParameterControlsProps): React.ReactElement {
  return (
    <Box>
      {parameters.map(param => (
        <Box key={param.name} sx={{ mb: 1 }}>
          {renderControl(param, source, onSourceChange)}
        </Box>
      ))}
    </Box>
  );
}

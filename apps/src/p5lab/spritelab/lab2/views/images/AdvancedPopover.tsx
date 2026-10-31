// The knobs behind the advanced switch, in a popover off the pane's
// header: a typed prompt, a coarser grid, and the current picture as the
// starting point.

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Popover from '@code-dot-org/component-library/popover';
import {IconButton as MuiIconButton} from '@mui/material';
import React, {useState} from 'react';

import useThemeMode from '@cdo/apps/pixelEditor/useThemeMode';

import {defaultPixelGrid} from '../../ai/images/modelHelpers';
import {ImageType} from '../../ai/images/types';

import styles from './images-tab.module.scss';

/** What the popover holds; the scene reads it as it generates. */
export interface AdvancedSettings {
  prompt: string;
  pixelScale: number;
  startFrom: boolean;
}

export const DEFAULT_ADVANCED: AdvancedSettings = {
  prompt: '',
  pixelScale: 1,
  startFrom: false,
};

// Divisors of the kind's default pixel grid.
const PIXEL_SCALES = [1, 2, 4];
const MAX_PROMPT_LENGTH = 1000;
const TITLE = 'Advanced';

interface AdvancedPopoverProps {
  imageType: ImageType;
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
  /** There is a current picture to start from. */
  hasImage: boolean;
  disabled?: boolean;
}

const AdvancedPopover: React.FunctionComponent<AdvancedPopoverProps> = ({
  imageType,
  settings,
  onChange,
  hasImage,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const mode = useThemeMode();
  const set = (patch: Partial<AdvancedSettings>) =>
    onChange({...settings, ...patch});
  return (
    <div className={styles.advancedHost}>
      <MuiIconButton
        variant="text"
        color="tertiary"
        size="small"
        aria-label={TITLE}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(current => !current)}
      >
        <FontAwesomeV6Icon iconName="sliders" aria-hidden />
      </MuiIconButton>
      {open && (
        <Popover
          id="images-advanced-popover"
          role="dialog"
          aria-label={TITLE}
          direction="onLeft"
          title={TITLE}
          content="These settings are for authors; students make pictures from the words."
          className={styles.advancedPopover}
          onClose={() => setOpen(false)}
        >
          <label className={styles.advancedField}>
            <span>Prompt (instead of the words)</span>
            <textarea
              className={styles.advancedPrompt}
              value={settings.prompt}
              rows={3}
              maxLength={MAX_PROMPT_LENGTH}
              onChange={e => set({prompt: e.target.value})}
            />
          </label>
          <SimpleDropdown
            name="images-advanced-grid"
            labelText="Resolution"
            size="s"
            color={mode === 'dark' ? 'white' : 'black'}
            items={PIXEL_SCALES.map(scale => {
              const grid = defaultPixelGrid(imageType) / scale;
              return {
                value: String(scale),
                text: `${grid} × ${grid}${scale === 1 ? ' (default)' : ''}`,
              };
            })}
            selectedValue={String(settings.pixelScale)}
            onChange={e => set({pixelScale: Number(e.target.value)})}
          />
          <label className={styles.advancedField}>
            <input
              type="checkbox"
              checked={settings.startFrom && hasImage}
              disabled={!hasImage}
              onChange={e => set({startFrom: e.target.checked})}
            />
            <span>Start from this image (the prompt modifies it)</span>
          </label>
        </Popover>
      )}
    </div>
  );
};

export default AdvancedPopover;

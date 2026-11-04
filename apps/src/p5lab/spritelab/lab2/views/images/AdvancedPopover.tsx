// The Advanced settings, in a popover opened from a button in the pane's
// header: a typed prompt that replaces the words, a coarser pixel grid, and
// the current picture as the model's starting image.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Popover from '@code-dot-org/component-library/popover';
import {IconButton as MuiIconButton} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {defaultPixelGrid} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {AdvancedOptions} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene';
import useThemeMode from '@cdo/apps/pixelEditor/useThemeMode';

import styles from './images-tab.module.scss';

/** The popover's settings; SentenceScene applies them on the next
    generation. `startFrom` is a choice here and a reader of the current
    picture there. */
export type AdvancedSettings = Required<
  Pick<AdvancedOptions, 'prompt' | 'pixelScale'>
> & {startFrom: boolean};

export const DEFAULT_ADVANCED: AdvancedSettings = {
  prompt: '',
  pixelScale: 1,
  startFrom: false,
};

// Divisors of the kind's default pixel grid.
const PIXEL_SCALES = [1, 2, 4];
const MAX_PROMPT_LENGTH = 1000;
const TITLE = 'Advanced';
const POPOVER_ID = 'images-advanced-popover';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const updateSettings = (patch: Partial<AdvancedSettings>) =>
    onChange({...settings, ...patch});
  // The library's popover moves focus nowhere and ignores Escape: focus
  // goes to the first field on open and back to the button on close.
  useEffect(() => {
    if (open) {
      promptRef.current?.focus();
    }
  }, [open]);
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  return (
    <div className={styles.advancedHost}>
      <MuiIconButton
        ref={buttonRef}
        variant="text"
        color="tertiary"
        size="small"
        aria-label={TITLE}
        aria-expanded={open}
        aria-controls={open ? POPOVER_ID : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <FontAwesomeV6Icon iconName="sliders" aria-hidden />
      </MuiIconButton>
      {open && (
        <div
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              close();
            }
          }}
        >
          <Popover
            id={POPOVER_ID}
            role="dialog"
            aria-label={TITLE}
            direction="onLeft"
            title={TITLE}
            content="These settings are for authors; students make pictures from the words."
            className={styles.advancedPopover}
            onClose={close}
          >
            {/* The component library has no multi-line text field; a typed
                prompt needs the room, so this stays a plain textarea. */}
            <label className={styles.advancedField}>
              <span>Prompt (instead of the words)</span>
              <textarea
                ref={promptRef}
                className={styles.advancedPrompt}
                value={settings.prompt}
                rows={3}
                maxLength={MAX_PROMPT_LENGTH}
                onChange={e => updateSettings({prompt: e.target.value})}
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
              onChange={e =>
                updateSettings({pixelScale: Number(e.target.value)})
              }
            />
            <Checkbox
              name="images-advanced-start-from"
              label="Start from this image (the prompt modifies it)"
              size="s"
              className={styles.advancedField}
              checked={settings.startFrom && hasImage}
              disabled={!hasImage}
              onChange={e => updateSettings({startFrom: e.target.checked})}
            />
          </Popover>
        </div>
      )}
    </div>
  );
};

export default AdvancedPopover;

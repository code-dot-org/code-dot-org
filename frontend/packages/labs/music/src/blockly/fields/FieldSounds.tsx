import {useState, useCallback} from 'react';

import {
  Blockly,
  createReactField,
  getCSSVariable,
  measureTextWidth,
  createFieldText,
  createFieldIcon,
} from '@code-dot-org/blockly-workspace';
import type {
  ReactFieldEditorProps,
  ReactFieldPreviewContext,
  FieldSizeContext,
} from '@code-dot-org/blockly-workspace';

import MusicRegistry from '../../MusicRegistry';
import MusicLibrary from '../../player/MusicLibrary';
import SoundStyle from '../../utils/SoundStyle';
import SoundsPanel from '../../components/soundsPanel';

const FIELD_HEIGHT = 20;

/**
 * Gets the display text for a sound value.
 */
function getSoundText(value: string): string {
  return MusicLibrary.getInstance()?.getSoundForId(value)?.name || '';
}

/**
 * Calculates the dynamic size of the field based on text content.
 */
function getSoundSize({value, constants}: FieldSizeContext<string>) {
  const text = getSoundText(value);

  // Convert 13px font size to 9.75pt for measurement
  const fontSize = 9.75;
  const textWidth = measureTextWidth(text, fontSize, constants);

  // Width = 5px left margin + 17px icon + 4px gap + text width + 5px right margin
  const width = 5 + 17 + 4 + textWidth + 5;

  return {width, height: FIELD_HEIGHT};
}

/**
 * Renders the text-based preview with icon.
 */
function renderSoundPreview({
  value,
  element,
  width,
}: ReactFieldPreviewContext<string>) {
  const library = MusicLibrary.getInstance();
  const sound = library?.getSoundForId(value);
  const soundType = sound?.type;
  const text = sound?.name || '';

  // Create background rectangle
  Blockly.utils.dom.createSvgElement(
    'rect',
    {
      fill: getCSSVariable('neutral-gray-90'),
      x: 1,
      y: 1,
      width,
      height: FIELD_HEIGHT,
      rx: 3,
    },
    element,
  );

  // Add icon for the sound type
  if (soundType && SoundStyle[soundType]) {
    const style = SoundStyle[soundType];
    const iconElement = createFieldIcon(
      style.iconCode || '',
      5 + (style.marginLeft || 0),
      16,
      {
        fontSize: '13px',
        className: style.classNameFill,
      },
    );
    element.appendChild(iconElement);
  }

  // Add text element
  const textElement = createFieldText(text, 27, 16, {
    fontSize: '13px',
    fontStyle: soundType === 'vocal' ? 'italic' : undefined,
  });
  element.appendChild(textElement);
}

/**
 * Editor component for the sounds field.
 * Manages the playing preview state internally.
 */
function SoundsEditor({
  value,
  onChange,
  onClose,
}: ReactFieldEditorProps<string>) {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const library = MusicLibrary.getInstance();

  const defaultMode = MusicRegistry.showSoundsPanelInSoundsMode
    ? 'sounds'
    : 'packs';
  const sortUnrestrictedPacksByType = MusicRegistry.sortUnrestrictedPacksByType;

  const handlePreview = useCallback((previewValue: string) => {
    setPlayingPreview(previewValue);

    MusicRegistry.player.previewSound(previewValue, () => {
      // Only clear if this is still the active preview
      setPlayingPreview(current => (current === previewValue ? null : current));
    });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
    },
    [onChange],
  );

  if (!library) {
    return null;
  }

  return (
    <SoundsPanel
      library={library}
      currentValue={value}
      playingPreview={playingPreview || ''}
      showSoundFilters={MusicRegistry.showSoundFilters}
      defaultMode={defaultMode}
      sortUnrestrictedPacksByType={sortUnrestrictedPacksByType}
      onClose={handleClose}
      onPreview={handlePreview}
      onSelect={handleSelect}
    />
  );
}

/**
 * A custom field that renders the sound selection UI.
 * The UI is rendered by {@link SoundsPanel}.
 */
export const plugin = createReactField<string>({
  name: 'field_sounds',
  defaultValue: MusicLibrary.getInstance()?.getDefaultSound() || '',

  Editor: SoundsEditor,

  renderPreview: renderSoundPreview,
  renderBackground: false, // We handle our own background
  getText: getSoundText,
  getSize: getSoundSize,

  dropdownStyle: {
    color: getCSSVariable('neutral-gray-5'),
    width: '600px',
    backgroundColor: getCSSVariable('neutral-base-black'),
  },

  onDisposeDropdown: () => {
    MusicRegistry.player.cancelPreviews();
  },
});

export default plugin;

import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';

import MusicLibrary, {Sounds} from '@cdo/apps/music/player/MusicLibrary';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import moduleStyles from './edit-music-level-data.module.scss';

interface EditLibrarySoundsProps {
  library: MusicLibrary;
  currentValue?: Sounds;
  onChange: (selectedSounds: Sounds | undefined) => void;
  selectedPack?: string;
}

/**
 * Editor for selecting library and allowed sounds.
 */
const EditLibrarySounds: React.FunctionComponent<EditLibrarySoundsProps> = ({
  library,
  currentValue,
  onChange,
  selectedPack,
}) => {
  const onSoundChange = useCallback(
    (sound: string, pack: string, checked: boolean) => {
      const newSelected = {...currentValue};
      if (checked) {
        if (!newSelected[pack]) {
          newSelected[pack] = [];
        }
        newSelected[pack].push(sound);
      } else {
        newSelected[pack] = newSelected[pack].filter(s => s !== sound);
        if (newSelected[pack].length === 0) {
          delete newSelected[pack];
        }
      }
      onChange(newSelected);
    },
    [currentValue, onChange]
  );

  const onToggleAll = useCallback(
    (pack: string, checked: boolean) => {
      const newSelected = {...currentValue};
      if (checked) {
        const selectedPack = library.getFolderForFolderId(pack);
        if (!selectedPack) {
          return;
        }
        newSelected[pack] = selectedPack.sounds
          .filter(s => s.type !== 'preview')
          .map(s => s.src);
      } else {
        delete newSelected[pack];
      }
      onChange(newSelected);
    },
    [currentValue, onChange, library]
  );

  const allSelected = useCallback(
    (pack: string) => {
      if (!currentValue || !currentValue[pack]) {
        return false;
      }
      const selectedPack = library.getFolderForFolderId(pack);
      if (!selectedPack) {
        return false;
      }
      return selectedPack.sounds
        .filter(s => s.type !== 'preview')
        .every(s => currentValue[pack].includes(s.src));
    },
    [currentValue, library]
  );

  return (
    <CollapsibleSection
      headerContent={'Choose Allowed Sounds'}
      initiallyCollapsed={false}
    >
      <div className={moduleStyles.indentedContainer}>
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          disabled={!currentValue}
          onClick={() => {
            onChange(undefined);
          }}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="ban" />}
        >
          {'Clear allowed sounds (enable all sounds)'}
        </MuiButton>
      </div>
      {library.packs.map(pack => {
        if (pack.restricted && pack.id !== selectedPack) {
          return null;
        }
        const currentlySelected = currentValue && currentValue[pack.id];
        const title =
          pack.name +
          (pack.artist && ` - ${pack.artist}`) +
          ` (${currentlySelected?.length || 0})`;
        return (
          <div className={moduleStyles.indentedContainer} key={pack.id}>
            <CollapsibleSection
              headerContent={
                <Typography
                  className={moduleStyles.noMargin}
                  variant="body2"
                  gutterBottom
                >
                  {currentlySelected && currentlySelected.length > 0 ? (
                    <Typography variant="strong">{title}</Typography>
                  ) : (
                    title
                  )}
                </Typography>
              }
            >
              <Typography variant="body4" gutterBottom>
                <i>
                  Numbers in square brackets indicate the length of the sound in
                  measures.
                </i>
              </Typography>
              <div className={moduleStyles.indentedContainer}>
                <Checkbox
                  name={pack.name + '-select-all'}
                  label={'(select all)'}
                  checked={allSelected(pack.id)}
                  onChange={event => onToggleAll(pack.id, event.target.checked)}
                  size="s"
                />
                {pack.sounds.map(sound => {
                  if (sound.type === 'preview') {
                    return null;
                  }
                  return (
                    <Checkbox
                      key={sound.src}
                      name={sound.src}
                      label={`${sound.name} [${sound.length}]`}
                      checked={
                        (currentlySelected &&
                          currentlySelected.includes(sound.src)) ||
                        false
                      }
                      onChange={event =>
                        onSoundChange(sound.src, pack.id, event.target.checked)
                      }
                      size="s"
                    />
                  );
                })}
              </div>
            </CollapsibleSection>
          </div>
        );
      })}
    </CollapsibleSection>
  );
};

export default EditLibrarySounds;

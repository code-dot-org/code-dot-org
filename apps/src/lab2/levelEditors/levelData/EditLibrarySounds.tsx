import React, {useCallback} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import MusicLibrary, {Sounds} from '@cdo/apps/music/player/MusicLibrary';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import moduleStyles from './edit-music-level-data.module.scss';

interface EditLibrarySoundsProps {
  library: MusicLibrary;
  currentValue?: Sounds;
  onChange: (selectedSounds: Sounds | undefined) => void;
}

/**
 * Editor for selecting library and allowed sounds.
 */
const EditLibrarySounds: React.FunctionComponent<EditLibrarySoundsProps> = ({
  library,
  currentValue,
  onChange,
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
        <Button
          text="Clear allowed sounds (enable all sounds)"
          onClick={() => {
            onChange(undefined);
          }}
          size="s"
          disabled={!currentValue}
        />
      </div>
      {library.packs.map(pack => {
        const currentlySelected = currentValue && currentValue[pack.id];
        const title =
          pack.name +
          (pack.artist && ` - ${pack.artist}`) +
          ` (${currentlySelected?.length || 0})`;
        return (
          <div className={moduleStyles.indentedContainer}>
            <CollapsibleSection
              headerContent={
                currentlySelected && currentlySelected.length > 0 ? (
                  <StrongText>{title}</StrongText>
                ) : (
                  title
                )
              }
            >
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
                      name={sound.src}
                      label={sound.name}
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

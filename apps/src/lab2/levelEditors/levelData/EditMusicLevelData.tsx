import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {DEFAULT_LIBRARY} from '@cdo/apps/music/constants';
import MusicLibrary, {Sounds} from '@cdo/apps/music/player/MusicLibrary';
import {MusicLevelData} from '@cdo/apps/music/types';
import {loadLibrary} from '@cdo/apps/music/utils/Loader';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import moduleStyles from './edit-music-level-data.module.scss';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

const VALID_LIBRARIES = [DEFAULT_LIBRARY, 'launch2024'];

interface EditMusicLevelDataProps {
  initialLevelData: MusicLevelData;
}

const EditMusicLevelData: React.FunctionComponent<EditMusicLevelDataProps> = ({
  initialLevelData,
}) => {
  const [levelData, setLevelData] = useState(initialLevelData);

  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const loadedLibraries = useRef<{[libraryName: string]: MusicLibrary}>({});

  const fetchLibrary = useCallback(async (libraryName: string) => {
    const library = await loadLibrary(libraryName);
    loadedLibraries.current[libraryName] = library;
  }, []);

  // Fetch library whenever it changes
  useEffect(() => {
    if (levelData.library === undefined) {
      return;
    }

    if (!loadedLibraries.current[levelData.library]) {
      setIsLoadingLibrary(true);
      fetchLibrary(levelData.library).then(() => {
        setIsLoadingLibrary(false);
      });
    }
  }, [levelData.library, fetchLibrary]);

  return (
    <div>
      <input
        type="hidden"
        id="level_level_data"
        name="level[level_data]"
        value={JSON.stringify(levelData)}
      />
      <CollapsibleSection title="Library & Sounds">
        <SimpleDropdown
          labelText="Library"
          name="library"
          size="s"
          items={VALID_LIBRARIES.map(library => ({
            value: library,
            text: library,
          }))}
          selectedValue={levelData.library}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            setLevelData({...levelData, library: event.target.value});
          }}
        />
        {levelData.library && loadedLibraries.current[levelData.library] && (
          <EditLibrarySounds
            library={loadedLibraries.current[levelData.library]}
            currentValue={levelData.sounds}
            onChange={selectedSounds => {
              setLevelData({...levelData, sounds: selectedSounds});
            }}
          />
        )}
      </CollapsibleSection>
      <div>
        {isLoadingLibrary ? 'Loading library...' : 'Library loaded!'}
        <br />
        Current library: &nbsp;
        {levelData.library && loadedLibraries.current[levelData.library]
          ? JSON.stringify(loadedLibraries.current[levelData.library].packs)
          : null}
      </div>
      <div>
        Current Value: &nbsp;
        {JSON.stringify(levelData)}
      </div>
    </div>
  );
};

interface EditLibrarySoundsProps {
  library: MusicLibrary;
  currentValue?: Sounds;
  onChange: (selectedSounds: Sounds) => void;
}

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
      title="Choose Allowed Sounds"
      titleVisualAppearance="body-two"
    >
      {library.packs.map(pack => {
        const currentlySelected = currentValue && currentValue[pack.id];
        return (
          <div className={moduleStyles.soundSelectSection}>
            <CollapsibleSection
              title={
                pack.name +
                (pack.artist && ` - ${pack.artist}`) +
                ` (${currentlySelected?.length || 0})`
              }
              titleStyle={
                currentlySelected && currentlySelected.length > 0
                  ? moduleStyles.packSectionSelected
                  : moduleStyles.packSectionEmpty
              }
              titleVisualAppearance="body-three"
              collapsedIcon="caret-down"
              expandedIcon="caret-up"
            >
              <div className={moduleStyles.soundsContainer}>
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

export default EditMusicLevelData;

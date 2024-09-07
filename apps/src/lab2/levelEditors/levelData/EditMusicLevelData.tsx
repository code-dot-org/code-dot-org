import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {BlockMode, DEFAULT_LIBRARY} from '@cdo/apps/music/constants';
import MusicLibrary, {loadLibrary} from '@cdo/apps/music/player/MusicLibrary';
import {MusicLevelData} from '@cdo/apps/music/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import EditLibrarySounds from './EditLibrarySounds';
import EditMusicToolbox from './EditMusicToolbox';
import RawJsonEditor from './RawJsonEditor';

import moduleStyles from './edit-music-level-data.module.scss';

const VALID_LIBRARIES = [DEFAULT_LIBRARY, 'launch2024'];

const JSON_FIELDS = [['startSources', 'Start Sources']] as const;

interface EditMusicLevelDataProps {
  initialLevelData: MusicLevelData;
}

/**
 * Levelbuilder editor UI for music level data.
 */
const EditMusicLevelData: React.FunctionComponent<EditMusicLevelDataProps> = ({
  initialLevelData,
}) => {
  const [levelData, setLevelData] = useState(initialLevelData);

  const [loadedLibraries, setLoadedLibraries] = useState<{
    [libraryName: string]: MusicLibrary;
  }>({});

  // Fetch library whenever it changes
  useEffect(() => {
    const libraryName = levelData.library;
    if (libraryName === undefined) {
      return;
    }

    if (!loadedLibraries[libraryName]) {
      loadLibrary(libraryName).then(library => {
        setLoadedLibraries({...loadedLibraries, [libraryName]: library});
      });
    }
  }, [levelData.library, loadedLibraries]);

  const hasRestrictedSounds = useMemo(
    () =>
      levelData.library &&
      loadedLibraries[levelData.library]?.getHasRestrictedPacks(),
    [levelData.library, loadedLibraries]
  );

  const restrictedPacks = useMemo(
    () =>
      levelData.library &&
      loadedLibraries[levelData.library]
        ?.getRestrictedPacks()
        ?.map(({name, id}) => ({value: id, text: name})),
    [levelData.library, loadedLibraries]
  );

  return (
    <div>
      <input
        type="hidden"
        id="level_level_data"
        name="level[level_data]"
        value={JSON.stringify(levelData)}
      />
      <CollapsibleSection headerContent="Library & Sounds">
        <div className={moduleStyles.section}>
          <div>
            <SimpleDropdown
              labelText="Selected Library"
              name="library"
              size="s"
              items={VALID_LIBRARIES.map(library => ({
                value: library,
                text: library,
              }))}
              selectedValue={levelData.library}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                // Reset sounds and packId when changing libraries
                setLevelData({
                  ...levelData,
                  library: event.target.value,
                  sounds: undefined,
                  packId: undefined,
                });
              }}
            />
          </div>
          {hasRestrictedSounds && restrictedPacks && (
            <div>
              <SimpleDropdown
                labelText="Selected Artist Pack"
                name="packId"
                size="s"
                items={restrictedPacks}
                selectedValue={levelData.packId}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const packId =
                    event.target.value === 'none'
                      ? undefined
                      : event.target.value;
                  setLevelData({...levelData, packId});
                }}
              />
            </div>
          )}
          {levelData.library && loadedLibraries[levelData.library] ? (
            <div
              className={classNames(
                moduleStyles.section,
                moduleStyles.indentedContainer
              )}
            >
              <EditLibrarySounds
                library={loadedLibraries[levelData.library]}
                currentValue={levelData.sounds}
                onChange={selectedSounds => {
                  if (
                    selectedSounds &&
                    Object.keys(selectedSounds).length === 0
                  ) {
                    selectedSounds = undefined;
                  }
                  setLevelData({...levelData, sounds: selectedSounds});
                }}
                selectedPack={levelData.packId}
              />
            </div>
          ) : (
            'Loading...'
          )}
        </div>
      </CollapsibleSection>
      <hr />
      <CollapsibleSection headerContent="Interface">
        <div
          className={classNames(moduleStyles.section, moduleStyles.topSpacing)}
        >
          <Checkbox
            checked={!!levelData.showSoundFilters}
            name="showSoundFilters"
            label="Show Sound Filters in Sound Picker"
            onChange={event => {
              setLevelData({
                ...levelData,
                showSoundFilters: event.target.checked,
              });
            }}
            size="s"
          />
        </div>
      </CollapsibleSection>
      <hr />
      <CollapsibleSection headerContent="Toolbox">
        <EditMusicToolbox
          toolbox={
            levelData.toolbox || {
              blocks: {},
            }
          }
          blockMode={levelData.blockMode || BlockMode.SIMPLE2}
          onChange={toolbox => setLevelData({...levelData, toolbox})}
          onBlockModeChange={blockMode =>
            // Reset toolbox blocks when changing block mode
            setLevelData({
              ...levelData,
              blockMode,
              toolbox: {
                ...levelData.toolbox,
                blocks: {},
              },
            })
          }
        />
      </CollapsibleSection>
      <hr />
      {JSON_FIELDS.map(([fieldName, fieldLabel]) => {
        return (
          <>
            <CollapsibleSection headerContent={`${fieldLabel} (JSON)`}>
              <RawJsonEditor
                currentValue={levelData[fieldName]}
                fieldName={fieldName}
                onChange={newValue =>
                  setLevelData({
                    ...levelData,
                    [fieldName]: newValue as MusicLevelData[typeof fieldName],
                  })
                }
              />
            </CollapsibleSection>
            <hr />
          </>
        );
      })}
      <CollapsibleSection headerContent="View Level Data JSON">
        <p className={moduleStyles.renderedJson}>
          {JSON.stringify(levelData, null, 2)}
        </p>
      </CollapsibleSection>
    </div>
  );
};

export default EditMusicLevelData;

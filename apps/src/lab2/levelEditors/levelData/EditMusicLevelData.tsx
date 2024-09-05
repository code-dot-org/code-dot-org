import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {DEFAULT_LIBRARY} from '@cdo/apps/music/constants';
import MusicLibrary, {loadLibrary} from '@cdo/apps/music/player/MusicLibrary';
import {MusicLevelData} from '@cdo/apps/music/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import EditLibrarySounds from './EditLibrarySounds';
import RawJsonEditor from './RawJsonEditor';

import moduleStyles from './edit-music-level-data.module.scss';

const VALID_LIBRARIES = [DEFAULT_LIBRARY, 'launch2024'];

const JSON_FIELDS = [
  ['toolbox', 'Toolbox'],
  ['startSources', 'Start Sources'],
] as const;

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
              setLevelData({...levelData, library: event.target.value});
            }}
            className={moduleStyles.dropdown}
          />
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
              />
            </div>
          ) : (
            'Loading...'
          )}
        </div>
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
      <CollapsibleSection headerContent="Current Level Data JSON">
        <p className={moduleStyles.renderedJson}>
          {JSON.stringify(levelData, null, 2)}
        </p>
      </CollapsibleSection>
    </div>
  );
};

export default EditMusicLevelData;

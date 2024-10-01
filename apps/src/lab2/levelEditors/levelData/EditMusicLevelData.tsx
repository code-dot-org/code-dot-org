import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {installFunctionBlocks} from '@cdo/apps/music/blockly/blockUtils';
import {setUpBlocklyForMusicLab} from '@cdo/apps/music/blockly/setup';
import {BlockMode, DEFAULT_LIBRARY} from '@cdo/apps/music/constants';
import MusicRegistry from '@cdo/apps/music/MusicRegistry';
import MusicLibrary from '@cdo/apps/music/player/MusicLibrary';
import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import {MusicLevelData} from '@cdo/apps/music/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import EditLibrarySounds from './EditLibrarySounds';
import EditMusicToolbox from './EditMusicToolbox';
import RawJsonEditor from './RawJsonEditor';

import moduleStyles from './edit-music-level-data.module.scss';

const VALID_LIBRARIES = [DEFAULT_LIBRARY, 'launch2024'];
const RECOMMENDED_LIBRARY = 'launch2024';

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
  useEffect(() => {
    setUpBlocklyForMusicLab();
    MusicRegistry.player = new MusicPlayer();
  }, []);

  const [levelData, setLevelData] = useState(initialLevelData);
  // Immediately set a level, if needed, so we can populate its allowed sounds.
  if (!levelData.library) {
    levelData.library = RECOMMENDED_LIBRARY;
  }

  const blockMode = levelData.blockMode || BlockMode.SIMPLE2;
  useEffect(() => {
    installFunctionBlocks(blockMode);
  }, [blockMode]);

  const [loadedLibraries, setLoadedLibraries] = useState<{
    [libraryName: string]: MusicLibrary;
  }>({});

  // Fetch library whenever it changes
  useEffect(() => {
    const libraryName = levelData.library || DEFAULT_LIBRARY;
    MusicLibrary.loadLibrary(libraryName).then(library => {
      if (!loadedLibraries[libraryName]) {
        setLoadedLibraries({...loadedLibraries, [libraryName]: library});
      }
    });
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
          <i>
            Note that currently, all levels within a lesson must use the same
            library.
          </i>
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
                items={[{value: 'none', text: '(none)'}, ...restrictedPacks]}
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
          toolbox={levelData.toolbox}
          blockMode={levelData.blockMode || BlockMode.SIMPLE2}
          addFunctionCalls={levelData.toolbox?.addFunctionCalls}
          onChange={toolbox => setLevelData({...levelData, toolbox})}
          onBlockModeChange={blockMode =>
            // Reset toolbox blocks when changing block mode
            setLevelData({
              ...levelData,
              blockMode,
              toolbox: {
                ...levelData.toolbox,
                blocks: undefined,
                addFunctionCalls: undefined,
              },
            })
          }
          onAddFunctionCallsChange={(addFunctionCalls: boolean) => {
            setLevelData({
              ...levelData,
              toolbox: {
                ...levelData.toolbox,
                addFunctionCalls,
              },
            });
          }}
        />
      </CollapsibleSection>
      <hr />
      {JSON_FIELDS.map(([fieldName, fieldLabel]) => {
        return (
          <>
            {fieldName === 'startSources' && (
              <div>
                {
                  'You can also edit start sources using Blockly using Extra Links.'
                }
              </div>
            )}
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
      <CollapsibleSection headerContent="Edit Level Data JSON">
        <div className={moduleStyles.section}>
          <Alert
            type="warning"
            text="Editing level data JSON directly will override any changes made in other sections"
            size="xs"
          />
          <RawJsonEditor
            currentValue={levelData}
            fieldName={'levelData'}
            onChange={newValue => setLevelData(newValue as MusicLevelData)}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default EditMusicLevelData;

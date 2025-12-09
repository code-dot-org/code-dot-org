import Alert from '@code-dot-org/component-library/alert';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';

import {installFunctionBlocks} from '@cdo/apps/music/blockly/blockUtils';
import {setUpBlocklyForMusicLab} from '@cdo/apps/music/blockly/setup';
import {
  BlockMode,
  DEFAULT_BPM,
  DEFAULT_LIBRARY,
  DEFAULT_PACK,
  DEFAULT_VALIDATION_TIMEOUT,
} from '@cdo/apps/music/constants';
import MusicRegistry from '@cdo/apps/music/MusicRegistry';
import MusicLibrary, {Sounds} from '@cdo/apps/music/player/MusicLibrary';
import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import {MusicLevelData} from '@cdo/apps/music/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import EditLibrarySounds from './EditLibrarySounds';
import EditMusicToolbox from './EditMusicToolbox';
import RawJsonEditor from './RawJsonEditor';

import moduleStyles from './edit-music-level-data.module.scss';

const VALID_LIBRARIES = [
  DEFAULT_LIBRARY,
  'launch2024',
  'launch2024-preview',
  'curriculum2024',
];
const RECOMMENDED_LIBRARY = 'launch2024';

const JSON_FIELDS = [['startSources', 'Start Sources']] as const;

const NO_DANCER_MOVE = 'none';
const SUPPORTED_DANCE_MOVES = [
  {value: NO_DANCER_MOVE, text: '(no dancer)'},
  {value: 'rest', text: 'None (Rest)'},
  {value: 'roll', text: 'Body Roll'},
  {value: 'clap_high', text: 'Clap High'},
  {value: 'dab', text: 'Dab'},
  {value: 'double_jam', text: 'Double Down'},
  {value: 'drop', text: 'Drop'},
  {value: 'floss', text: 'Floss'},
  {value: 'fresh', text: 'Fresh'},
  {value: 'clown', text: 'Gangnam'},
  {value: 'kick', text: 'Star'},
  {value: 'this_or_that', text: 'This or That'},
  {value: 'thriller', text: 'Zombie'},
];

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

  const restrictedPackOptions = useMemo(
    () =>
      levelData.library &&
      loadedLibraries[levelData.library]
        ?.getRestrictedPacks()
        // Sort by artist name, then by pack name if artists are the same
        ?.sort((a, b) =>
          a.artist && b.artist
            ? a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name)
            : 0
        )
        ?.map(({name, id, artist, bpm, sounds}) => {
          // Use the pack bpm if present, or the bpm of the first sound that has one.
          const packTempo =
            bpm || sounds?.find(sound => sound.bpm)?.bpm || DEFAULT_BPM;
          return {
            value: id,
            text: `[${packTempo}] ${artist} - ${name}`,
          };
        }),
    [levelData.library, loadedLibraries]
  );

  const restrictedPackKeys =
    (restrictedPackOptions || []).map(pack => pack.value) || [];
  return (
    <ThemeProvider>
      <input
        type="hidden"
        id="level_level_data"
        name="level[level_data]"
        value={JSON.stringify(levelData)}
      />
      <CollapsibleSection headerContent="Library & Sounds">
        <div className={moduleStyles.section}>
          <i>Tips for levelbuilders:</i>
          <ul>
            <li>Currently, only the launch2024 library supports Share/Remix</li>
            <li>
              The intro2024 library is no longer maintained but is still used in
              early music lab progressions - consider picking a newer library
              instead!
            </li>
            <li>
              The launch2024-preview and curriculum2024 libraries are just
              staging grounds for sounds that we want to test out in scripts not
              intended for full launch. Once those sounds are finalized, they
              will be put into the launch2024 library in the appropriate form.
            </li>
          </ul>
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
          {hasRestrictedSounds && restrictedPackOptions && (
            <div>
              <SimpleDropdown
                labelText="Selected Artist Pack"
                name="packId"
                size="s"
                items={[
                  {value: 'none', text: '(none)'},
                  {
                    value: DEFAULT_PACK,
                    text: `[${DEFAULT_BPM}] Code.org (Default)`,
                  },
                  ...restrictedPackOptions,
                ]}
                selectedValue={levelData.packId}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const packId =
                    event.target.value === 'none'
                      ? undefined
                      : event.target.value;
                  // Reset selected sounds from previously selected packs.
                  const previousSounds = levelData.sounds;
                  const sounds = previousSounds
                    ? Object.keys(previousSounds)
                        .filter(
                          soundKey => !restrictedPackKeys.includes(soundKey)
                        )
                        .reduce((newSounds: Sounds, key) => {
                          newSounds[key] = previousSounds[key];
                          return newSounds;
                        }, {})
                    : undefined;
                  setLevelData({...levelData, packId, sounds});
                }}
              />
              <BodyFourText>
                <i>Numbers in square brackets indicate the pack tempo (BPM).</i>
              </BodyFourText>
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
              const showSoundFilters = event.target.checked;
              setLevelData({
                ...levelData,
                showSoundFilters,
                ...(showSoundFilters
                  ? {}
                  : {
                      showSoundsPanelInSoundsMode: false,
                      sortUnrestrictedPacksByType: false,
                    }),
              });
            }}
            size="s"
          />
          <Checkbox
            checked={!!levelData.showSoundsPanelInSoundsMode}
            name="showSoundsPanelInSoundsMode"
            label="Default to 'Sounds' mode in Sound Picker"
            onChange={event => {
              const showSoundsPanelInSoundsMode = event.target.checked;
              setLevelData({
                ...levelData,
                showSoundsPanelInSoundsMode,
                ...(showSoundsPanelInSoundsMode
                  ? {showSoundFilters: true}
                  : {}),
              });
            }}
            size="s"
          />
          <Checkbox
            checked={!!levelData.sortUnrestrictedPacksByType}
            name="sortUnrestrictedPacksByType"
            label="Sort unrestricted (Code.org) packs by type in Sound Picker"
            onChange={event => {
              const sortUnrestrictedPacksByType = event.target.checked;
              setLevelData({
                ...levelData,
                sortUnrestrictedPacksByType,
                ...(sortUnrestrictedPacksByType
                  ? {showSoundFilters: true}
                  : {}),
              });
            }}
            size="s"
          />
          <Checkbox
            checked={!!levelData.allowChangeStartingPlayheadPosition}
            name="allowChangeStartingPlayheadPosition"
            label="Allow change starting playhead position"
            onChange={event => {
              setLevelData({
                ...levelData,
                allowChangeStartingPlayheadPosition: event.target.checked,
              });
            }}
            size="s"
          />
          <div className={moduleStyles.inputRow}>
            <label htmlFor="validationTimeout" className={moduleStyles.label}>
              Validation Timeout:
            </label>
            <BodyFourText className={moduleStyles.helperText}>
              This value determines when (in measures) non-success validation
              messages should start appearing. If the timeout is reached or the
              last measure has completed, messages will be shown.
            </BodyFourText>

            <input
              type="number"
              id="validationTimeout"
              name="validationTimeout"
              value={levelData.validationTimeout}
              placeholder={DEFAULT_VALIDATION_TIMEOUT.toString()}
              min={1}
              onChange={event => {
                const parsedValue = parseInt(event.target.value);
                setLevelData({
                  ...levelData,
                  validationTimeout: !isNaN(parsedValue)
                    ? parsedValue
                    : undefined,
                });
              }}
              className={moduleStyles.input}
            />
          </div>
          <div className={moduleStyles.inputRow}>
            <label htmlFor="danceMove" className={moduleStyles.label}>
              Hour of AI Settings:
            </label>
            <BodyFourText className={moduleStyles.helperText}>
              If a dance move is set, the selected dance move will be used to
              animate an AI generated Lottie Dancer over the timeline.
            </BodyFourText>
            <SimpleDropdown
              labelText="Dance Move"
              name="danceMove"
              size="s"
              items={SUPPORTED_DANCE_MOVES}
              selectedValue={levelData.danceMove}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                let danceMove: string | undefined = event.target.value;
                if (danceMove === NO_DANCER_MOVE) {
                  danceMove = undefined;
                }
                setLevelData({...levelData, danceMove});
              }}
            />
          </div>
        </div>
      </CollapsibleSection>
      <hr />
      <div>
        {'You can also edit toolbox blocks using Blockly using Extra Links.'}
      </div>
      <CollapsibleSection headerContent="Toolbox">
        <EditMusicToolbox
          toolbox={levelData.toolbox}
          blockMode={levelData.blockMode || BlockMode.SIMPLE2}
          addFunctionDefinition={levelData.toolbox?.addFunctionDefinition}
          addFunctionCalls={levelData.toolbox?.addFunctionCalls}
          onChange={toolbox =>
            // Reset toolbox mode configuration when changing toolbox settings
            setLevelData({...levelData, toolbox, toolboxDefinition: undefined})
          }
          onBlockModeChange={blockMode => {
            const startSourcesFilename = `startSources${blockMode}`;
            const startSources = require(`@cdo/static/music/${startSourcesFilename}.json`);

            // Reset toolbox blocks when changing block mode
            setLevelData({
              ...levelData,
              blockMode,
              startSources,
              toolbox: {
                ...levelData.toolbox,
                blocks: undefined,
                addFunctionDefinition: undefined,
                addFunctionCalls: undefined,
              },
              toolboxDefinition: undefined,
            });
          }}
          onAddFunctionDefinitionChange={(addFunctionDefinition: boolean) => {
            setLevelData({
              ...levelData,
              toolbox: {
                ...levelData.toolbox,
                addFunctionDefinition,
                // Call blocks are required if definitions are included.
                addFunctionCalls: addFunctionDefinition
                  ? true
                  : levelData.toolbox?.addFunctionCalls,
              },
            });
          }}
          onAddFunctionCallsChange={(addFunctionCalls: boolean) => {
            setLevelData({
              ...levelData,
              toolbox: {
                ...levelData.toolbox,
                // Definitions are prohibited unless call blocks are included.
                addFunctionDefinition: !addFunctionCalls
                  ? false
                  : levelData.toolbox?.addFunctionDefinition,
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
    </ThemeProvider>
  );
};

export default EditMusicLevelData;

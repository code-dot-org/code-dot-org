import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import FocusLock from 'react-focus-lock';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

import {getBaseAssetUrl} from '../appConfig';
import musicI18n from '../locale';
import MusicLibrary, {
  SoundData,
  SoundFolder,
  SoundType,
} from '../player/MusicLibrary';
import SoundStyle from '../utils/SoundStyle';

import EaseIntoView from './EaseIntoView';

import styles from './soundsPanel2.module.scss';

const easeIntoViewDelayFramesFolders = 0;
const easeIntoViewDelayFramesSounds = 5;
const easeIntoViewFrames = 50;
const easeIntoViewDistanceY = 70;

/*
 * Renders a UI for previewing and choosing samples.  Version 2 implements a new UI that shows a
 * larger grid of sound entries, and both previews and selects the sound when its entry is clicked,
 * though without dismissing the panel.
 * This is currently used within a custom Blockly Field {@link FieldSounds}
 */

type Mode = 'packs' | 'sounds';
type Filter = 'all' | SoundType;

type SoundEntry = {
  folder: SoundFolder;
  sound: SoundData;
};

// FolderPanelRow: A single folder.

interface FolderPanelRowProps {
  libraryGroupPath: string;
  playingPreview: string;
  folder: SoundFolder;
  currentValue: SoundFolder;
  onSelect: (path: SoundFolder) => void;
  onPreview: (path: string) => void;
  currentFolderRefCallback: (ref: HTMLDivElement) => void;
}

const FolderPanelRow: React.FunctionComponent<FolderPanelRowProps> = ({
  libraryGroupPath,
  playingPreview,
  folder,
  currentValue,
  onSelect,
  onPreview,
  currentFolderRefCallback,
}) => {
  const previewSound = folder.sounds.find(sound => sound.type === 'preview');
  const soundPath = previewSound && folder.id + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc =
    folder.imageSrc &&
    `${getBaseAssetUrl()}${libraryGroupPath}/${folder.path}/${folder.imageSrc}`;

  const isSelected = folder.id === currentValue.id;

  const onPreviewClick = useCallback(
    (e: Event) => {
      if (soundPath && !isPlayingPreview) {
        onPreview(soundPath);
      }
      e.stopPropagation();
    },
    [isPlayingPreview, onPreview, soundPath]
  );

  return (
    <div
      className={classNames(
        'sounds-panel-folder-row',
        classNames(styles.folderRow, isSelected && styles.folderRowSelected)
      )}
      onClick={() => onSelect(folder)}
      onKeyDown={useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter') {
            onSelect(folder);
          }
        },
        [folder, onSelect]
      )}
      ref={isSelected ? currentFolderRefCallback : null}
      aria-label={folder.name}
      tabIndex={0}
      role="button"
    >
      <div className={styles.folderRowLeft}>
        {imageSrc && (
          <img src={imageSrc} className={styles.folderImage} alt="" />
        )}
      </div>
      <div className={styles.folderRowMiddle}>
        <div className={styles.folderRowMiddleName}>{folder.name}</div>
        {folder.artist && (
          <div className={styles.folderRowMiddleSubTitle}>{folder.artist}</div>
        )}
      </div>
      <div className={styles.folderRowRight}>
        {previewSound && (
          <div className={styles.previewContainer}>
            <FontAwesome
              title={undefined}
              icon={'play-circle'}
              className={classNames(
                styles.preview,
                isPlayingPreview && styles.previewPlaying
              )}
              onClick={onPreviewClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// SoundPanelEntry: A single sound.

interface SoundsPanelEntryProps {
  currentValue: string;
  playingPreview: string;
  folder: SoundFolder;
  sound: SoundData;
  showingSoundsOnly: boolean;
  onSelect: (path: string) => void;
  onPreview: (path: string) => void;
  currentSoundRefCallback?: (ref: HTMLDivElement) => void;
}

const SoundsPanelEntry: React.FunctionComponent<SoundsPanelEntryProps> = ({
  currentValue,
  playingPreview,
  folder,
  sound,
  onSelect,
  onPreview,
  currentSoundRefCallback,
}) => {
  const soundPath = folder.id + '/' + sound.src;
  const isSelected = soundPath === currentValue;
  const isPlayingPreview = playingPreview === soundPath;

  const onSoundSelect = useCallback(() => {
    if (!isPlayingPreview) {
      onPreview(soundPath);
    }
    onSelect(soundPath);
  }, [isPlayingPreview, onPreview, onSelect, soundPath]);

  const onSoundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onSoundSelect();
    },
    [onSoundSelect]
  );

  return (
    <div
      className={classNames(
        'sounds-panel-sound-entry',
        styles.soundEntry,
        isSelected && styles.soundEntrySelected
      )}
      onClick={onSoundClick}
      onKeyDown={useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter') {
            onSoundSelect();
          }
        },
        [onSoundSelect]
      )}
      ref={isSelected ? currentSoundRefCallback : null}
      aria-label={sound.name}
      tabIndex={0}
      role="button"
    >
      <div className={styles.soundEntryMain}>
        <div
          className={classNames(
            styles.iconContainer,
            SoundStyle[sound.type]?.classNameBackground,
            SoundStyle[sound.type]?.classNameBorder,
            isSelected && styles.iconContainerSelected
          )}
        >
          <FontAwesomeV6Icon
            iconName={SoundStyle[sound.type]?.icon || ''}
            className={classNames(
              styles.typeIcon,
              SoundStyle[sound.type]?.classNameColor
            )}
          />
        </div>
        <div
          className={classNames(
            styles.name,
            sound.type === 'vocal' && styles.nameVocal
          )}
        >
          {sound.name}
        </div>
      </div>
    </div>
  );
};

// SoundsPanel: a component used inside a Blockly dropdown that allows
// for browsing folders and the sounds inside them.

interface SoundsPanelProps {
  library: MusicLibrary;
  currentValue: string;
  playingPreview: string;
  showSoundFilters: boolean;
  onSelect: (path: string) => void;
  onPreview: (path: string) => void;
}

const SoundsPanel: React.FunctionComponent<SoundsPanelProps> = ({
  library,
  currentValue,
  playingPreview,
  showSoundFilters,
  onSelect,
  onPreview,
}) => {
  const folders = library.getAvailableSounds();
  const libraryGroupPath = library.getPath();

  const [selectedFolder, setSelectedFolder] = useState<SoundFolder>(
    library.getAllowedFolderForSoundId(currentValue) || folders[0]
  );
  const [mode, setMode] = useState<Mode>('packs');
  const [filter, setFilter] = useState<Filter>('all');

  const currentFolderRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const currentSoundRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

  // Capture whether the initially-selected sound is the default sound, in which
  // case we will do a smooth ease into view, rather than scroll directly
  // to the current sound.  Uses useRef so that changes to this value don't trigger
  // additional executions of the "Initial render" useEffect, below.
  const isDefaultSoundSelected = useRef(
    currentValue === library.getDefaultSound()
  );

  const onModeChange = useCallback((value: Mode) => {
    setMode(value);
  }, []);

  const onFilterChange = useCallback((value: Filter) => {
    setFilter(value);
  }, []);

  // Initial render.
  useEffect(() => {
    // If the user has selected a non-default sound, then jump directly to it.
    // If the default sound is selected, then the EaseIntoView component will do
    // an initial scroll instead.
    if (!isDefaultSoundSelected.current) {
      // This timeout allows the initial scroll-to-current-selection to work
      // when wrapping the content with FocusLock.
      setTimeout(() => {
        currentFolderRef.current?.scrollIntoView();
        currentSoundRef.current?.scrollIntoView();
      }, 0);
    }
  }, []);

  const currentFolderRefCallback = (ref: HTMLDivElement) => {
    currentFolderRef.current = ref;
  };

  const currentSoundRefCallback = (ref: HTMLDivElement) => {
    currentSoundRef.current = ref;
  };

  let possibleSoundEntries: SoundEntry[] = [];
  let rightColumnSoundEntries: SoundEntry[] = [];

  if (mode === 'packs') {
    folders.sort((a, b) =>
      a.restricted === b.restricted ? 0 : a.restricted ? -1 : 1
    );
    possibleSoundEntries = selectedFolder.sounds.map(sound => ({
      folder: selectedFolder,
      sound,
    }));
  } else {
    folders.forEach(folder => {
      folder.sounds.forEach(sound => {
        possibleSoundEntries.push({folder, sound});
      });
    });
  }

  rightColumnSoundEntries = possibleSoundEntries.filter(
    soundEntry =>
      soundEntry.sound.type !== 'preview' &&
      (soundEntry.sound.type === filter || filter === 'all')
  );

  const availableSoundTypes: {[key: string]: boolean} = {
    all: true,
    ...library.getAvailableSoundTypes(),
  };

  const allFilterButtons = [
    {label: musicI18n.soundsFilterAll(), value: 'all'},
    {label: musicI18n.soundsFilterBeats(), value: 'beat'},
    {label: musicI18n.soundsFilterBass(), value: 'bass'},
    {label: musicI18n.soundsFilterLeads(), value: 'lead'},
    {label: musicI18n.soundsFilterEffects(), value: 'fx'},
    {label: musicI18n.soundsFilterVocals(), value: 'vocal'},
  ];

  const filterButtons = allFilterButtons.filter(
    filterButton => availableSoundTypes[filterButton.value]
  );

  return (
    <FocusLock>
      <div id="sounds-panel" className={styles.soundsPanel} aria-modal>
        <div id="hidden-item" tabIndex={0} role="button" />
        {showSoundFilters && (
          <div id="sounds-panel-top" className={styles.soundsPanelTop}>
            <SegmentedButtons
              selectedButtonValue={mode}
              buttons={[
                {label: musicI18n.soundsFilterPacks(), value: 'packs'},
                {label: musicI18n.soundsFilterSounds(), value: 'sounds'},
              ]}
              onChange={value => onModeChange(value as Mode)}
              className={styles.segmentedButtons}
            />

            <SegmentedButtons
              selectedButtonValue={filter}
              buttons={filterButtons}
              onChange={value => onFilterChange(value as Filter)}
              className={styles.segmentedButtons}
            />
          </div>
        )}
        <div id="sounds-panel-body" className={styles.soundsPanelBody}>
          {mode === 'packs' && (
            <EaseIntoView
              id="sounds-panel-left"
              className={styles.leftColumn}
              doEase={isDefaultSoundSelected.current}
              delay={easeIntoViewDelayFramesFolders}
              frames={easeIntoViewFrames}
              distanceY={easeIntoViewDistanceY}
            >
              {folders.map(folder => {
                return (
                  <FolderPanelRow
                    key={folder.id}
                    libraryGroupPath={libraryGroupPath}
                    playingPreview={playingPreview}
                    folder={folder}
                    currentValue={selectedFolder}
                    onSelect={setSelectedFolder}
                    onPreview={onPreview}
                    currentFolderRefCallback={currentFolderRefCallback}
                  />
                );
              })}
            </EaseIntoView>
          )}
          <EaseIntoView
            id="sounds-panel-right"
            className={classNames(
              styles.rightColumn,
              mode === 'sounds' && styles.rightColumnFullWidth
            )}
            doEase={isDefaultSoundSelected.current}
            delay={easeIntoViewDelayFramesSounds}
            frames={easeIntoViewFrames}
            distanceY={easeIntoViewDistanceY}
          >
            {rightColumnSoundEntries.map(soundEntry => {
              return (
                <SoundsPanelEntry
                  key={soundEntry.folder.id + '/' + soundEntry.sound.src}
                  currentValue={currentValue}
                  playingPreview={playingPreview}
                  folder={soundEntry.folder}
                  sound={soundEntry.sound}
                  showingSoundsOnly={mode === 'sounds'}
                  onSelect={onSelect}
                  onPreview={onPreview}
                  currentSoundRefCallback={currentSoundRefCallback}
                />
              );
            })}
          </EaseIntoView>
        </div>
      </div>
    </FocusLock>
  );
};

export default SoundsPanel;

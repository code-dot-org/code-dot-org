import React, {useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {getBaseAssetUrl} from '../appConfig';
import styles from './soundsPanel.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import MusicLibrary, {SoundData, SoundFolder} from '../player/MusicLibrary';
import FocusLock from 'react-focus-lock';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';

/*
 * Renders a UI for previewing and choosing samples. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */

const getLengthRepresentation = (length: number) => {
  const lengthToSymbol: {[length: number]: string} = {
    0.5: '\u00bd',
    0.25: '\u00bc',
  };
  return lengthToSymbol[length] || length;
};

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
  const previewSound = folder.sounds.find(sound => sound.preview);
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
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onSelect(folder);
        }
      }}
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
      </div>
      <div className={styles.folderRowRight}>
        <div className={styles.length}>&nbsp;</div>
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

interface SoundsPanelRowProps {
  currentValue: string;
  playingPreview: string;
  folder: SoundFolder;
  sound: SoundData;
  onSelect: (path: string) => void;
  onPreview: (path: string) => void;
  currentSoundRefCallback: (ref: HTMLDivElement) => void;
}

const SoundsPanelRow: React.FunctionComponent<SoundsPanelRowProps> = ({
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
  const typeIconPath = `/blockly/media/music/icon-${sound.type}.png`;
  const onPreviewClick = useCallback(
    (e: Event) => {
      if (!isPlayingPreview) {
        onPreview(soundPath);
      }
      e.stopPropagation();
    },
    [isPlayingPreview, onPreview, soundPath]
  );

  return (
    <div
      className={classNames(
        'sounds-panel-sound-row',
        styles.soundRow,
        isSelected && styles.soundRowSelected
      )}
      onClick={() => onSelect(folder.id + '/' + sound.src)}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onSelect(folder.id + '/' + sound.src);
        }
      }}
      ref={isSelected ? currentSoundRefCallback : null}
      aria-label={sound.name}
      tabIndex={0}
      role="button"
    >
      <div className={styles.soundRowLeft}>
        <img src={typeIconPath} className={styles.typeIcon} alt="" />
      </div>
      <div className={styles.soundRowMiddle}>{sound.name}</div>
      <div className={styles.soundRowRight}>
        <div className={styles.length}>
          {getLengthRepresentation(sound.length)}
        </div>
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
      </div>
    </div>
  );
};

interface SoundsPanelProps {
  library: MusicLibrary;
  currentValue: string;
  playingPreview: string;
  onSelect: (path: string) => void;
  onPreview: (path: string) => void;
}

const SoundsPanel: React.FunctionComponent<SoundsPanelProps> = ({
  library,
  currentValue,
  playingPreview,
  onSelect,
  onPreview,
}) => {
  const folders = library.getAllowedSounds(undefined);
  const libraryGroupPath = library.libraryJson.id;

  const [selectedFolder, setSelectedFolder] = useState<SoundFolder>(
    library.getFolderForId(currentValue) || folders[0]
  );
  const [mode, setMode] = useState<string>('packs');
  const [filter, setFilter] = useState<string>('all');

  const currentFolderRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const currentSoundRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

  const onModeChange = (value: string) => {
    setMode(value);
  };

  const onFilterChange = (value: string) => {
    setFilter(value);
  };

  useEffect(() => {
    currentFolderRef.current?.scrollIntoView();
    currentSoundRef.current?.scrollIntoView();
  }, []);

  const currentFolderRefCallback = (ref: HTMLDivElement) => {
    currentFolderRef.current = ref;
  };

  const currentSoundRefCallback = (ref: HTMLDivElement) => {
    currentSoundRef.current = ref;
  };

  /*
  // Generate a flat list of entries to render.  We need a flat list because
  // we will make the headers sticky.
  const entries: {
    type: 'folder' | 'sound';
    folder: SoundFolder;
    sound?: SoundData;
  }[] = [];
  folders.forEach(folder => {
    entries.push({type: 'folder', folder: folder});
    folder.sounds.forEach(sound => {
      entries.push({type: 'sound', folder: folder, sound: sound});
    });
  });
  */

  let possibleSounds: SoundData[] = [];
  let rightColumnSounds: SoundData[] = [];

  if (mode === 'packs') {
    possibleSounds = selectedFolder.sounds;
  } else {
    folders.forEach(folder => {
      folder.sounds.forEach(sound => {
        possibleSounds.push(sound);
      });
    });
  }

  if (filter === 'all') {
    rightColumnSounds = possibleSounds;
  } else {
    rightColumnSounds = possibleSounds.filter(
      sound => filter === 'all' || sound.type === filter
    );
  }

  return (
    <FocusLock>
      <div id="sounds-panel" className={styles.soundsPanel} aria-modal>
        <div id="sounds-panel-top" className={styles.soundsPanelTop}>
          <SegmentedButtons
            selectedButtonValue={mode}
            buttons={[
              {label: 'Packs', value: 'packs'},
              {label: 'Sounds', value: 'sounds'},
            ]}
            onChange={value => onModeChange(value)}
            className={styles.segmentedButtons}
          />

          <SegmentedButtons
            selectedButtonValue={filter}
            buttons={[
              {label: 'All', value: 'all'},
              {label: 'Beats', value: 'beat'},
              {label: 'Bass', value: 'bass'},
              {label: 'Leads', value: 'lead'},
              {label: 'Effects', value: 'fx'},
              {label: 'Vocals', value: 'vocal'},
            ]}
            onChange={value => onFilterChange(value)}
            className={styles.segmentedButtons}
          />
        </div>
        <div id="sounds-panel-body" className={styles.soundsPanelBody}>
          {mode === 'packs' && (
            <div id="sounds-panel-left" className={styles.leftColumn}>
              {folders.map((folder, folderIndex) => {
                return (
                  <FolderPanelRow
                    key={folderIndex}
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
            </div>
          )}
          <div id="sounds-panel-right" className={styles.rightColumn}>
            {rightColumnSounds.map((sound, soundIndex) => {
              return (
                <SoundsPanelRow
                  key={soundIndex}
                  currentValue={currentValue}
                  playingPreview={playingPreview}
                  folder={selectedFolder}
                  sound={sound}
                  onSelect={onSelect}
                  onPreview={onPreview}
                  currentSoundRefCallback={currentSoundRefCallback}
                />
              );
            })}
          </div>
        </div>
      </div>
    </FocusLock>
  );
  /*
  return (
    <div id="sounds-panel" className={styles.soundsPanel}>
      {entries.map((entry, entryIndex) => {
        if (entry.type === 'folder') {
          return (
            <FolderPanelRow
              key={entryIndex}
              libraryGroupPath={libraryGroupPath}
              playingPreview={playingPreview}
              folder={entry.folder}
              onPreview={onPreview}
            />
          );
        } else if (entry.sound && !entry.sound.preview) {
          return (
            <SoundsPanelRow
              key={entryIndex}
              currentValue={currentValue}
              playingPreview={playingPreview}
              folder={entry.folder}
              sound={entry.sound}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          );
        }
      })}
    </div>
  );
  */
};

export default SoundsPanel;

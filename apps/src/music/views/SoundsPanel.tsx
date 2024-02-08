import React, {useCallback} from 'react';
import classNames from 'classnames';
import {baseAssetUrl} from '../constants';
import styles from './soundsPanel.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import MusicLibrary, {SoundData, SoundFolder} from '../player/MusicLibrary';

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
  onPreview: (path: string) => void;
}

const FolderPanelRow: React.FunctionComponent<FolderPanelRowProps> = ({
  libraryGroupPath,
  playingPreview,
  folder,
  onPreview,
}) => {
  const previewSound = folder.sounds.find(sound => sound.preview);
  const soundPath = previewSound && folder.path + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc =
    folder.imageSrc &&
    `${baseAssetUrl}${libraryGroupPath}/${folder.path}/${folder.imageSrc}`;

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
    <div className={classNames('sounds-panel-folder-row', styles.folderRow)}>
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
}

const SoundsPanelRow: React.FunctionComponent<SoundsPanelRowProps> = ({
  currentValue,
  playingPreview,
  folder,
  sound,
  onSelect,
  onPreview,
}) => {
  const soundPath = folder.path + '/' + sound.src;
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
      onClick={() => onSelect(folder.path + '/' + sound.src)}
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
  const libraryGroupPath = library.groups[0].path;

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
};

export default SoundsPanel;

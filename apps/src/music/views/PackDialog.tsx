import React, {useCallback, useState, useRef} from 'react';
import Typography from '@cdo/apps/componentLibrary/typography';
import FocusLock from 'react-focus-lock';
import styles from './PackDialog.module.scss';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';
import {getBaseAssetUrl} from '../appConfig';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import MusicPlayer from '../player/MusicPlayer';

interface PackEntryProps {
  libraryGroupPath: string;
  playingPreview: string | null;
  folder: SoundFolder;
  onSelect: (path: SoundFolder) => void;
  onPreview: (path: string) => void;
}

const PackEntry: React.FunctionComponent<PackEntryProps> = ({
  libraryGroupPath,
  playingPreview,
  folder,
  onSelect,
  onPreview,
}) => {
  const previewSound = folder.sounds.find(sound => sound.preview);
  const soundPath = previewSound && folder.id + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc =
    folder.imageSrc &&
    `${getBaseAssetUrl()}${libraryGroupPath}/${folder.path}/${folder.imageSrc}`;

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
      className={classNames(styles.pack, classNames(styles.folderRow))}
      onClick={() => onSelect(folder)}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onSelect(folder);
        }
      }}
      aria-label={folder.name}
      tabIndex={0}
      role="button"
    >
      <div className={styles.packImageContainer}>
        {imageSrc && <img src={imageSrc} className={styles.packImage} alt="" />}
      </div>
      <div className={styles.packDescription}>
        <div className={styles.packName}>{folder.name}</div>
        {folder.artist && (
          <div className={styles.packArtist}>{folder.artist}</div>
        )}
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

interface PackDialogProps {
  currentPackName: string;
  setCurrentPackName: (packName: string) => void;
  player: MusicPlayer;
}

/**
 * Packs Dialog.
 */
const PackDialog: React.FunctionComponent<PackDialogProps> = ({
  currentPackName,
  setCurrentPackName,
  player,
}) => {
  const library = MusicLibrary.getInstance();

  // Use a ref for instant access to this value inside onPreview.
  const playingPreview = useRef<string | null>(null);

  // Use state so that we can re-render when the preview state changes.
  const [playingPreviewState, setPlayingPreviewState] = useState<string | null>(
    null
  );

  if (!library) return null;

  const folders = library.getAllowedSounds(undefined);
  const libraryGroupPath = library.libraryJson.path;

  const setSelectedFolder = (folder: SoundFolder) => {
    setCurrentPackName(folder.id);
  };
  const onPreview = (id: string) => {
    playingPreview.current = id;
    setPlayingPreviewState(id);

    player.previewSound(id, () => {
      // If the user starts another preview while one is
      // already playing, it will have started playing before
      // we get this stop event.  We want to wait until the
      // new preview stops before we reactivate the button, and
      // so we don't clear out playingPreview unless the
      // stop event coming in is for the actively playing preview.
      if (playingPreview.current === id) {
        playingPreview.current = null;
        setPlayingPreviewState(null);
      }
    });
  };

  if (currentPackName) {
    return null;
  }

  return (
    <FocusLock>
      <div className={styles.dialogContainer}>
        <div id="pack-dialog" className={styles.packDialog}>
          <div id="hidden-item" tabIndex={0} role="button" />
          <Typography
            semanticTag="h1"
            visualAppearance="heading-lg"
            className={styles.heading}
          >
            Choose Pack
          </Typography>

          <div className={styles.packs}>
            {folders.map((folder, folderIndex) => {
              return (
                <PackEntry
                  key={folderIndex}
                  libraryGroupPath={libraryGroupPath}
                  playingPreview={playingPreviewState}
                  folder={folder}
                  onSelect={setSelectedFolder}
                  onPreview={onPreview}
                />
              );
            })}
          </div>
        </div>
      </div>
    </FocusLock>
  );
};

export default PackDialog;

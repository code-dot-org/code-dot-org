import React, {useCallback, useState} from 'react';
import Typography from '@cdo/apps/componentLibrary/typography';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import FocusLock from 'react-focus-lock';
import styles from './PackDialog.module.scss';
import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import i18n from '@cdo/locale';
import MusicLibrary, {
  SoundData,
  SoundFolder,
  SoundType,
} from '../player/MusicLibrary';
import {getBaseAssetUrl} from '../appConfig';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

interface PackEntryProps {
  libraryGroupPath: string;
  playingPreview: string;
  folder: SoundFolder;
  currentValue: SoundFolder;
  onSelect: (path: SoundFolder) => void;
  onPreview: (path: string) => void;
}

const PackEntry: React.FunctionComponent<PackEntryProps> = ({
  libraryGroupPath,
  playingPreview,
  folder,
  currentValue,
  onSelect,
  onPreview,
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
        styles.pack,
        classNames(styles.folderRow, isSelected && styles.folderRowSelected)
      )}
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
}

/**
 * Packs Dialog.
 */
const PackDialog: React.FunctionComponent<PackDialogProps> = ({
  currentPackName,
  setCurrentPackName,
}) => {
  const library = MusicLibrary.getInstance();

  if (!library) return null;

  const [isShowing, setIsShowing] = useState<boolean>(false);

  const folders = library.getAllowedSounds(undefined);
  const libraryGroupPath = library.libraryJson.path;

  const playingPreview = '';
  const currentValue = library.getAllowedFolderForFolderId(
    undefined,
    currentPackName
  );
  const setSelectedFolder = (folder: SoundFolder) => {
    setIsShowing(false);
    setCurrentPackName(folder.id);
  };
  const onPreview = () => {};
  const selectedFolder = folders[0];

  if (currentPackName) {
    return null;
  }

  return (
    <FocusLock>
      <div className={styles.dialogContainer}>
        <div id="pack-dialog" className={styles.packDialog}>
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
                  playingPreview={playingPreview}
                  folder={folder}
                  currentValue={selectedFolder}
                  onSelect={setSelectedFolder}
                  onPreview={onPreview}
                />
              );
            })}
          </div>

          {/*
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => {}}
          >
            <FontAwesomeV6Icon
              iconName={'xmark'}
              iconStyle="thin"
              className={styles.closeButtonIcon}
            />
          </button>
          */}
        </div>
      </div>
    </FocusLock>
  );
};

export default PackDialog;

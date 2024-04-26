import React, {useCallback, useState, useRef} from 'react';
import Typography from '@cdo/apps/componentLibrary/typography';
import FocusLock from 'react-focus-lock';
import styles from './PackDialog.module.scss';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {setPackId} from '../redux/musicRedux';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import MusicPlayer from '../player/MusicPlayer';
import {DEFAULT_PACK} from '../constants';
import musicI18n from '../locale';

interface PackEntryProps {
  playingPreview: string | null;
  folder: SoundFolder;
  isSelected: boolean;
  onSelect: (path: SoundFolder) => void;
  onPreview: (path: string) => void;
}

const PackEntry: React.FunctionComponent<PackEntryProps> = ({
  playingPreview,
  folder,
  isSelected,
  onSelect,
  onPreview,
}) => {
  const library = MusicLibrary.getInstance();

  const previewSound = folder.sounds.find(sound => sound.type === 'preview');
  const soundPath = previewSound && folder.id + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc = library?.getPackImageUrl(folder.id);

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
      className={classNames(styles.pack, isSelected && styles.packSelected)}
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
        {imageSrc && (
          <img
            src={imageSrc}
            className={classNames(
              styles.packImage,
              isSelected && styles.packImageSelected
            )}
            alt=""
            draggable={false}
          />
        )}
      </div>
      <div className={styles.packFooter}>
        <div>
          <div className={styles.packFooterName}>{folder.name}</div>
          {folder.artist && (
            <div className={styles.packFooteArtist}>{folder.artist}</div>
          )}
        </div>
        {previewSound && (
          <div className={styles.packFooterPreview}>
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
  player: MusicPlayer;
}

/**
 * The PackDialog allows the user to preview and choose from the set of restricted
 * sound packs.
 */
const PackDialog: React.FunctionComponent<PackDialogProps> = ({player}) => {
  const dispatch = useAppDispatch();

  const currentPackId = useAppSelector(state => state.music.packId);

  const library = MusicLibrary.getInstance();

  // Use a ref for instant access to this value inside onPreview.
  const playingPreview = useRef<string | null>(null);

  // Use state so that we can re-render when the preview state changes.
  const [playingPreviewState, setPlayingPreviewState] = useState<string | null>(
    null
  );

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleSelectFolder = useCallback(
    (folder: SoundFolder) => {
      if (!library) {
        return;
      }

      if (selectedFolderId === folder.id) {
        setSelectedFolderId(null);
      } else {
        setSelectedFolderId(folder.id);
      }
    },
    [selectedFolderId, library]
  );

  const setPackToDefault = useCallback(() => {
    if (!library) {
      return;
    }

    dispatch(setPackId(DEFAULT_PACK));
    library.setCurrentPackId(DEFAULT_PACK);
    setSelectedFolderId(null);
  }, [dispatch, library]);

  const setPackToSelectedFolder = useCallback(() => {
    if (!library) {
      return;
    }

    if (selectedFolderId) {
      dispatch(setPackId(selectedFolderId));
      library.setCurrentPackId(selectedFolderId);
      setSelectedFolderId(null);
    }
  }, [selectedFolderId, dispatch, library]);

  const onPreview = useCallback(
    (id: string) => {
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
    },
    [player]
  );

  if (!library) return null;

  const folders = library.getRestrictedPacks();

  if (currentPackId) {
    return null;
  }

  return (
    <FocusLock className={styles.focusLock}>
      <div className={styles.dialogContainer}>
        <div id="pack-dialog" className={styles.packDialog}>
          <div id="hidden-item" tabIndex={0} role="button" />
          <Typography
            semanticTag="h1"
            visualAppearance="heading-lg"
            className={styles.heading}
          >
            {musicI18n.packDialogTitle()}
          </Typography>

          <div className={styles.body}>{musicI18n.packDialogBody()}</div>

          <div className={styles.packs}>
            {folders.map((folder, folderIndex) => {
              return (
                <PackEntry
                  key={folderIndex}
                  playingPreview={playingPreviewState}
                  folder={folder}
                  isSelected={folder.id === selectedFolderId}
                  onSelect={handleSelectFolder}
                  onPreview={onPreview}
                />
              );
            })}
          </div>

          <div className={styles.buttonContainer}>
            <button
              onClick={setPackToDefault}
              className={styles.skip}
              type="button"
            >
              Skip
            </button>
            <button
              onClick={setPackToSelectedFolder}
              className={classNames(
                styles.continue,
                styles.button,
                !selectedFolderId && styles.continueDisabled
              )}
              disabled={!selectedFolderId}
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </FocusLock>
  );
};

export default PackDialog;

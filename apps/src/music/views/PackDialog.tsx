import classNames from 'classnames';
import React, {useCallback, useState, useRef, useContext} from 'react';
import FocusLock from 'react-focus-lock';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_PACK} from '../constants';
import {AnalyticsContext} from '../context';
import musicI18n from '../locale';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import {setPackId} from '../redux/musicRedux';

import styles from './PackDialog.module.scss';

interface PackEntryProps {
  playingPreview: string | null;
  folder: SoundFolder;
  isSelected: boolean;
  onSelect: (path: SoundFolder) => void;
  onPreview: (path: string) => void;
  onStopPreview: () => void;
}

const PackEntry: React.FunctionComponent<PackEntryProps> = ({
  playingPreview,
  folder,
  isSelected,
  onSelect,
  onPreview,
  onStopPreview,
}) => {
  const library = MusicLibrary.getInstance();

  const previewSound = folder.sounds.find(sound => sound.type === 'preview');
  const soundPath = previewSound && folder.id + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc = library?.getPackImageUrl(folder.id);
  const imageAttributionAuthor = folder.imageAttribution?.author;
  const imageAttributionColor = folder.imageAttribution?.color;
  const packImageAttributionLeft = folder.imageAttribution?.position === 'left';

  const onEntryClick = useCallback(() => {
    onSelect(folder);

    if (soundPath && !isPlayingPreview) {
      onPreview(soundPath);
    }
  }, [folder, isPlayingPreview, onPreview, onSelect, soundPath]);

  return (
    <div
      className={classNames(styles.pack, isSelected && styles.packSelected)}
      onClick={onEntryClick}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onEntryClick();
        }
      }}
      aria-label={folder.name}
      tabIndex={0}
      role="button"
    >
      <div className={styles.packImageContainer}>
        {imageSrc && (
          <div
            className={classNames(
              styles.packImageContainer,
              isSelected && styles.packImageContainerSelected
            )}
          >
            <img
              className={styles.packImage}
              src={imageSrc}
              alt=""
              draggable={false}
            />
            {false && imageAttributionAuthor && (
              <div
                className={classNames(
                  styles.packImageAttribution,
                  packImageAttributionLeft && styles.packImageAttributionLeft
                )}
                style={{color: imageAttributionColor}}
              >
                <FontAwesomeV6Icon
                  iconName={'brands fa-creative-commons'}
                  iconStyle="solid"
                  className={styles.icon}
                />
                &nbsp;
                <FontAwesomeV6Icon
                  iconName={'brands fa-creative-commons-by'}
                  iconStyle="solid"
                  className={styles.icon}
                />
                &nbsp;
                {imageAttributionAuthor}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.packFooter}>
        <div>
          <div className={styles.packFooterName}>{folder.name}</div>
          {folder.artist && (
            <div className={styles.packFooteArtist}>{folder.artist}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const PackEntryThin: React.FunctionComponent<PackEntryProps> = ({
  playingPreview,
  folder,
  isSelected,
  onSelect,
  onPreview,
  onStopPreview,
}) => {
  const library = MusicLibrary.getInstance();

  const previewSound = folder.sounds.find(sound => sound.type === 'preview');
  const soundPath = previewSound && folder.id + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc = library?.getPackImageUrl(folder.id);
  const imageAttributionAuthor = folder.imageAttribution?.author;
  const imageAttributionColor = folder.imageAttribution?.color;
  const packImageAttributionLeft = folder.imageAttribution?.position === 'left';

  const onEntryClick = useCallback(() => {
    onSelect(folder);

    if (soundPath && !isPlayingPreview) {
      onPreview(soundPath);
    }
  }, [folder, isPlayingPreview, onPreview, onSelect, soundPath]);

  return (
    <div
      className={classNames(styles.pack, isSelected && styles.packSelected)}
      onClick={onEntryClick}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onEntryClick();
        }
      }}
      aria-label={folder.name}
      tabIndex={0}
      role="button"
    >
      <div>
        {imageSrc && (
          <div
            className={classNames(
              styles.packImageContainer,
              isSelected && styles.packImageContainerSelected
            )}
          >
            <img
              className={styles.packImage}
              src={imageSrc}
              alt=""
              draggable={false}
            />
            {imageAttributionAuthor && (
              <div
                className={classNames(
                  styles.packImageAttribution,
                  packImageAttributionLeft && styles.packImageAttributionLeft
                )}
                style={{color: imageAttributionColor}}
              >
                <FontAwesomeV6Icon
                  iconName={'brands fa-creative-commons'}
                  iconStyle="solid"
                  className={styles.icon}
                />
                &nbsp;
                <FontAwesomeV6Icon
                  iconName={'brands fa-creative-commons-by'}
                  iconStyle="solid"
                  className={styles.icon}
                />
                &nbsp;
                {imageAttributionAuthor}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.packFooter}>
        <div>
          <div className={styles.packFooterName}>{folder.name}</div>
          {folder.artist && (
            <div className={styles.packFooteArtist}>{folder.artist}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const PackEntryHero: React.FunctionComponent<PackEntryProps> = ({
  playingPreview,
  folder,
  isSelected,
  onSelect,
  onPreview,
  onStopPreview,
}) => {
  const library = MusicLibrary.getInstance();

  const previewSound = folder.sounds.find(sound => sound.type === 'preview');
  const soundPath = previewSound && folder.id + '/' + previewSound.src;
  const isPlayingPreview = previewSound && playingPreview === soundPath;
  const imageSrc = library?.getPackImageUrl(folder.id);
  const imageAttributionAuthor = folder.imageAttribution?.author;
  const imageAttributionColor = folder.imageAttribution?.color;
  const packImageAttributionLeft = folder.imageAttribution?.position === 'left';

  const onEntryClick = useCallback(() => {
    onSelect(folder);

    if (soundPath && !isPlayingPreview) {
      onPreview(soundPath);
    }
  }, [folder, isPlayingPreview, onPreview, onSelect, soundPath]);

  return (
    <div
      className={classNames(
        styles.pack,
        styles.packHero,
        isSelected && styles.packSelected
      )}
      onClick={onEntryClick}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onEntryClick();
        }
      }}
      aria-label={folder.name}
      tabIndex={0}
      role="button"
    >
      <div className={styles.content}>
        <div className={styles.packFooterHero}>
          <div>
            <div className={styles.packFooterName}>{folder.name}</div>
            {folder.artist && (
              <div className={styles.packFooteArtist}>{folder.artist}</div>
            )}
          </div>
        </div>
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

  const analyticsReporter = useContext(AnalyticsContext);

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

  const selectPack = useCallback(
    (packId: string) => {
      if (!library) {
        return;
      }

      player.cancelPreviews();
      dispatch(setPackId(packId));
      library.setCurrentPackId(packId);
      setSelectedFolderId(null);
      analyticsReporter?.onPackSelected(packId);
    },
    [library, dispatch, player, analyticsReporter]
  );

  const setPackToDefault = useCallback(() => {
    selectPack(DEFAULT_PACK);
  }, [selectPack]);

  const setPackToSelectedFolder = useCallback(() => {
    if (selectedFolderId) {
      selectPack(selectedFolderId);
    }
  }, [selectPack, selectedFolderId]);

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

  const onStopPreview = useCallback(() => {
    player.cancelPreviews();
  }, [player]);

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

          <div className={styles.packsContainer}>
            <div className={styles.packsThin}>
              {folders.map((folder, folderIndex) => {
                return folderIndex === 0 ? (
                  <PackEntryHero
                    key={folderIndex}
                    playingPreview={playingPreviewState}
                    folder={folders[24]}
                    isSelected={folder.id === selectedFolderId}
                    onSelect={handleSelectFolder}
                    onPreview={onPreview}
                    onStopPreview={onStopPreview}
                  />
                ) : (
                  <PackEntryThin
                    key={folderIndex}
                    playingPreview={playingPreviewState}
                    folder={folder}
                    isSelected={folder.id === selectedFolderId}
                    onSelect={handleSelectFolder}
                    onPreview={onPreview}
                    onStopPreview={onStopPreview}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.body}>{musicI18n.packDialogBody()}</div>

            <div className={styles.buttonContainer}>
              <button
                onClick={setPackToDefault}
                className={classNames('skip-button', styles.skip)}
                type="button"
              >
                {musicI18n.skip()}
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
                {musicI18n.continue()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusLock>
  );
};

export default PackDialog;

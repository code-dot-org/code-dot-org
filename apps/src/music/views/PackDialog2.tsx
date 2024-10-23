import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import {FocusOn} from 'react-focus-on';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';
import Typography from '@cdo/apps/componentLibrary/typography';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_PACK} from '../constants';
import {AnalyticsContext} from '../context';
import musicI18n from '../locale';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import {setPackId} from '../redux/musicRedux';

import styles from './PackDialog2.module.scss';

interface PackEntryProps {
  playingPreview: string | null;
  folder: SoundFolder;
  folderIndex: number;
  isSelected: boolean;
  onSelect: (path: SoundFolder) => void;
  onPreview: (path: string) => void;
  mode: Mode;
  currentFolderRefCallback: (ref: HTMLDivElement) => void;
}

const PackEntry: React.FunctionComponent<PackEntryProps> = ({
  playingPreview,
  folder,
  folderIndex,
  isSelected,
  onSelect,
  onPreview,
  mode,
  currentFolderRefCallback,
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
        !isSelected && folderIndex % 2 === 1 && styles.packAlternate,
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
      ref={isSelected ? currentFolderRefCallback : null}
    >
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
      <div
        className={classNames(
          styles.packName,
          mode !== 'artist' && styles.packBold
        )}
      >
        {folder.name}
      </div>
      {folder.artist && (
        <div
          className={classNames(
            styles.packArtist,
            mode === 'artist' && styles.packBold
          )}
        >
          {folder.artist}
        </div>
      )}
    </div>
  );
};

interface PackDialogProps {
  player: MusicPlayer;
}

type Mode = 'popular' | 'song' | 'artist';

/**
 * The PackDialog allows the user to preview and choose from the set of restricted
 * sound packs.
 */
const PackDialog2: React.FunctionComponent<PackDialogProps> = ({player}) => {
  const dispatch = useAppDispatch();

  const currentPackId = useAppSelector(state => state.music.packId);

  const library = MusicLibrary.getInstance();

  // Use a ref for instant access to this value inside onPreview.
  const playingPreview = useRef<string | null>(null);

  const [mode, setMode] = useState<Mode>('popular');

  // Use state so that we can re-render when the preview state changes.
  const [playingPreviewState, setPlayingPreviewState] = useState<string | null>(
    null
  );

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const currentFolderRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

  const analyticsReporter = useContext(AnalyticsContext);

  const handleSelectFolder = useCallback(
    (folder: SoundFolder) => {
      if (!library) {
        return;
      }

      if (selectedFolderId === folder.id) {
        setSelectedFolderId(null);
        player.cancelPreviews();
      } else {
        setSelectedFolderId(folder.id);
      }
    },
    [selectedFolderId, library, player]
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

  const currentFolderRefCallback = (ref: HTMLDivElement) => {
    currentFolderRef.current = ref;
  };

  // Scroll the current pack into view each time the mode changes.
  useEffect(() => {
    currentFolderRef.current?.scrollIntoView();
  }, [mode]);

  if (!library) return null;

  const folders = library.getRestrictedPacks();

  if (currentPackId) {
    return null;
  }

  const sortedFolders =
    mode === 'popular'
      ? folders
      : mode === 'song'
      ? folders.sort((a, b) => a.name.localeCompare(b.name))
      : folders.sort((a, b) =>
          a.artist && b.artist
            ? a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name)
            : 0
        );

  return (
    <FocusOn className={styles.focusLock}>
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

          <div className={styles.body} data-theme="Dark">
            <div>{musicI18n.packDialogBody()}</div>

            <SegmentedButtons
              selectedButtonValue={mode}
              buttons={[
                {label: musicI18n.packModePopular(), value: 'popular'},
                {label: musicI18n.packModeSong(), value: 'song'},
                {label: musicI18n.packModeArtist(), value: 'artist'},
              ]}
              onChange={value => setMode(value as Mode)}
              className={styles.segmentedButtons}
            />
          </div>

          <div className={styles.packsContainer}>
            <div className={styles.packs}>
              {sortedFolders.map((folder, folderIndex) => {
                return (
                  <PackEntry
                    key={folderIndex}
                    playingPreview={playingPreviewState}
                    folder={folder}
                    folderIndex={folderIndex}
                    isSelected={folder.id === selectedFolderId}
                    onSelect={handleSelectFolder}
                    onPreview={onPreview}
                    mode={mode}
                    currentFolderRefCallback={currentFolderRefCallback}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.footer}>
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
                {musicI18n.select()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusOn>
  );
};

export default PackDialog2;

import classNames from 'classnames';
import type {FunctionComponent, MouseEvent} from 'react';
import {useState, useEffect, useCallback, useRef} from 'react';
import FocusLock from 'react-focus-lock';

import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';

import type {SoundFolder, SoundType} from '../../api';
import {getBaseAssetUrl} from '../../appConfig';
import MusicLibrary from '../../player/MusicLibrary';
import type {SoundData} from '../../player/types';
import SoundStyle from '../../utils/SoundStyle';

import styles from './soundsPanel.module.scss';

type Mode = 'packs' | 'sounds';
type Filter = 'all' | SoundType;

type SoundEntry = {
  folder: SoundFolder;
  sound: SoundData;
};

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

const FolderPanelRow: FunctionComponent<FolderPanelRowProps> = ({
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
    (e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>) => {
      if (soundPath && !isPlayingPreview) {
        onPreview(soundPath);
      }
      e.stopPropagation();
    },
    [isPlayingPreview, onPreview, soundPath],
  );

  return (
    <div
      className={classNames(
        'sounds-panel-folder-row',
        classNames(styles.folderRow, isSelected && styles.folderRowSelected),
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
      role="tab"
      aria-selected={isSelected}
    >
      <div className={styles.folderRowLeft}>
        {imageSrc && (
          <img src={imageSrc} className={styles.folderImage} alt="" />
        )}
      </div>
      <div className={styles.folderRowMiddle}>
        <BodyThreeText className={styles.folderRowMiddleName}>
          {folder.name}
        </BodyThreeText>
        {folder.artist && (
          <BodyFourText className={styles.folderRowMiddleSubTitle}>
            {folder.artist}
          </BodyFourText>
        )}
      </div>
      <div className={styles.folderRowRight}>
        <div className={styles.length}>&nbsp;</div>
        {previewSound && (
          <div className={styles.previewContainer}>
            <Button
              isIconOnly={true}
              icon={{
                iconName: 'play-circle',
                iconStyle: 'regular',
              }}
              className={classNames(
                styles.preview,
                isPlayingPreview && styles.previewPlaying,
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
  showingSoundsOnly: boolean;
  onSelect: (path: string) => void;
  onPreview: (path: string) => void;
  currentSoundRefCallback: (ref: HTMLDivElement) => void;
}

const SoundsPanelRow: React.FunctionComponent<SoundsPanelRowProps> = ({
  currentValue,
  playingPreview,
  folder,
  sound,
  showingSoundsOnly,
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
    [onSoundSelect],
  );

  return (
    <div
      className={classNames(
        'sounds-panel-sound-row',
        styles.soundRow,
        isSelected && styles.soundRowSelected,
      )}
      onClick={onSoundClick}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          onSoundSelect();
        }
      }}
      ref={isSelected ? currentSoundRefCallback : null}
      aria-label={
        sound.name +
        'Measure Length' +
        String(getLengthRepresentation(sound.length))
      }
      tabIndex={0}
      role="tabpanel"
    >
      <div className={styles.soundRowLeft}>
        <FontAwesomeV6Icon
          iconName={SoundStyle[sound.type]?.icon || ''}
          className={classNames(
            styles.typeIcon,
            SoundStyle[sound.type]?.classNameColor,
          )}
          iconStyle="regular"
        />
        <BodyFourText
          className={classNames(
            styles.name,
            sound.type === 'vocal' && styles.nameVocal,
          )}
        >
          {sound.name}
        </BodyFourText>
      </div>
      {showingSoundsOnly && (
        <div className={styles.soundRowMiddle}>
          {folder.name} &bull; {folder.artist}
        </div>
      )}
      <div className={styles.soundRowRight}>
        <BodyFourText
          className={classNames(
            styles.length,
            styles.lengthNoMarginRight,
            isSelected && styles.lengthNoMarginRightSelected,
          )}
        >
          {getLengthRepresentation(sound.length)}
        </BodyFourText>
      </div>
    </div>
  );
};

export interface SoundsPanelProps {
  library: MusicLibrary;
  currentValue: string;
  playingPreview: string;
  showSoundFilters: boolean;
  defaultMode: Mode;
  sortUnrestrictedPacksByType: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  onPreview: (path: string) => void;
}

/**
 * Renders a UI for previewing and choosing samples. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */
const SoundsPanel: React.FunctionComponent<SoundsPanelProps> = ({
  library,
  currentValue,
  playingPreview,
  showSoundFilters,
  defaultMode,
  sortUnrestrictedPacksByType,
  onClose,
  onSelect,
  onPreview,
}) => {
  const folders = library.getAvailableSounds();
  const libraryGroupPath = library.getPath();

  const [selectedFolder, setSelectedFolder] = useState<SoundFolder>(
    library.getAllowedFolderForSoundId(currentValue) || folders[0],
  );
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [filter, setFilter] = useState<Filter>('all');
  const [isFocusSet, setIsFocusSet] = useState(false);

  const currentFolderRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

  const onModeChange = useCallback((value: Mode) => {
    setMode(value);
  }, []);

  const onFilterChange = useCallback((value: Filter) => {
    setFilter(value);
  }, []);

  useEffect(() => {
    // This timeout allows the initial scroll-to-current-selection to work
    // when wrapping the content with FocusLock.
    setTimeout(() => {
      currentFolderRef.current?.scrollIntoView();
    }, 0);
  }, []);

  const currentFolderRefCallback = (ref: HTMLDivElement) => {
    currentFolderRef.current = ref;
  };

  const currentSoundRefCallback = (ref: HTMLDivElement) => {
    if (!isFocusSet && ref) {
      setTimeout(() => {
        ref.focus();
        setIsFocusSet(true);
      }, 0);
    }
  };

  let possibleSoundEntries: SoundEntry[] = [];
  let rightColumnSoundEntries: SoundEntry[] = [];

  if (mode === 'packs') {
    folders.sort((a, b) =>
      a.restricted === b.restricted ? 0 : a.restricted ? -1 : 1,
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
    if (sortUnrestrictedPacksByType) {
      const soundTypes: SoundType[] = ['beat', 'bass', 'lead', 'fx', 'vocal'];
      possibleSoundEntries.sort((a, b) => {
        if (a.folder.artist === 'Code.org' && b.folder.artist === 'Code.org') {
          const aOrder = soundTypes.indexOf(a.sound.type);
          const bOrder = soundTypes.indexOf(b.sound.type);
          return aOrder - bOrder;
        }
        return 0;
      });
    }
  }

  if (filter === 'all') {
    rightColumnSoundEntries = possibleSoundEntries.filter(
      soundEntry => soundEntry.sound.type !== 'preview',
    );
  } else {
    rightColumnSoundEntries = possibleSoundEntries.filter(
      soundEntry =>
        soundEntry.sound.type === filter && soundEntry.sound.type !== 'preview',
    );
  }

  const availableSoundTypes: {[key: string]: boolean} = {
    all: true,
    ...library.getAvailableSoundTypes(),
  };

  const allFilterButtons = [
    {label: 'All', value: 'all'},
    {label: 'Beats', value: 'beat'},
    {label: 'Bass', value: 'bass'},
    {label: 'Leads', value: 'lead'},
    {label: 'Effects', value: 'fx'},
    {label: 'Vocals', value: 'vocal'},
  ];

  const filterButtons = allFilterButtons.filter(
    filterButton => availableSoundTypes[filterButton.value],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <FocusLock>
      <div
        id="sounds-panel"
        className={classNames(styles.soundsPanel)}
        aria-modal
        role="dialog"
        onKeyDown={handleKeyDown}
      >
        {showSoundFilters && (
          <div
            id="sounds-panel-top"
            className={styles.soundsPanelTop}
            data-theme="Dark"
          >
            <SegmentedButtons
              selectedButtonValue={mode}
              buttons={[
                {label: 'Packs', value: 'packs'},
                {label: 'Sounds', value: 'sounds'},
              ]}
              onChange={value => onModeChange(value as Mode)}
              className={styles.segmentedButtons}
              size="s"
            />

            <SegmentedButtons
              selectedButtonValue={filter}
              buttons={filterButtons}
              onChange={value => onFilterChange(value as Filter)}
              className={styles.segmentedButtons}
              size="s"
            />
          </div>
        )}
        <div id="sounds-panel-body" className={styles.soundsPanelBody}>
          {mode === 'packs' && (
            <div
              id="sounds-panel-left"
              role="tablist"
              aria-orientation="vertical"
              className={styles.leftColumn}
            >
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
          <div
            id="sounds-panel-right"
            className={styles.rightColumn}
            tabIndex={0}
            role="tabpanel"
            aria-label={'Sounds Panel, ' + selectedFolder.name}
          >
            {rightColumnSoundEntries.map((soundEntry, soundIndex) => {
              return (
                <SoundsPanelRow
                  key={soundIndex}
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
          </div>
        </div>
      </div>
    </FocusLock>
  );
};

export default SoundsPanel;

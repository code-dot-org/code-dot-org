import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classnames from 'classnames';
import React, {useState, useCallback, ChangeEvent} from 'react';

import {getFilteredSongKeys} from '@cdo/apps/dance/songs';
import {SongData} from '@cdo/apps/dance/types';
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';

import moduleStyles from '@cdo/apps/dance/song-selector.module.scss';

const commonI18n = require('@cdo/locale');

const currentTimeoutsMap: {[key: string]: ReturnType<typeof setTimeout>} = {};
const songPreviewDurationInMs = 10000;

interface SongSelectorProps {
  selectedSong: string;
  levelIsRunning?: boolean;
  setSong: (songId: string) => void;
  songData: SongData;
  enableSongSelection?: boolean;
  filterOn?: boolean;
}

const SongSelector: React.FC<SongSelectorProps> = ({
  selectedSong,
  levelIsRunning,
  setSong,
  songData,
  enableSongSelection,
  filterOn,
}) => {
  const [songInPreview, setSongInPreview] = useState(false);

  const onPreviewBtnClick = useCallback(() => {
    if (songInPreview) {
      audioCommands.stopSound({url: songData[selectedSong].url});
    } else {
      audioCommands.playSound({
        url: `${songData[selectedSong].url}`,
        callback: () => {
          setSongInPreview(true);
          const timeoutID = setTimeout(() => {
            if (!levelIsRunning) {
              audioCommands.stopSound({url: songData[selectedSong].url});
            }
          }, songPreviewDurationInMs);

          currentTimeoutsMap[selectedSong] = timeoutID;
        },
        onEnded: () => {
          currentTimeoutsMap[selectedSong] &&
            clearTimeout(currentTimeoutsMap[selectedSong]);

          delete currentTimeoutsMap[selectedSong];

          setSongInPreview(false);
        },
      });
    }
  }, [levelIsRunning, selectedSong, songData, songInPreview]);

  const songKeys = getFilteredSongKeys(songData, filterOn);

  // When you change the song - unloadSong is triggered in apps/src/dance/songs.js. (which unloads and stops the current song)
  // When song is stopped - audioCommands.playSound onEnded callback is triggered where we set setSongInPreview(false).
  const changeSong = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const songId = event.target.value;
      setSong(songId);
    },
    [setSong]
  );

  return (
    <div
      id="song-selector-wrapper"
      className={moduleStyles.songSelectorWrapper}
    >
      <SimpleDropdown
        id="song_selector"
        name="song_selector"
        className={moduleStyles.selectStyle}
        labelText={commonI18n.selectSong()}
        items={songKeys.map(option => ({
          value: option,
          text: songData[option].title,
        }))}
        selectedValue={selectedSong}
        onChange={changeSong}
        disabled={!enableSongSelection}
        size="s"
        color="black"
        dropdownTextThickness="thin"
      />

      <MuiIconButton
        type="button"
        variant="outlined"
        color="secondary"
        size="small"
        className={classnames(
          moduleStyles.previewSongButton,
          !levelIsRunning && songInPreview && moduleStyles.previewActiveButton
        )}
        disabled={levelIsRunning}
        aria-label={songInPreview ? 'Pause' : 'Play'}
        onClick={onPreviewBtnClick}
      >
        <FontAwesomeV6Icon iconName="play-pause" />
      </MuiIconButton>
    </div>
  );
};

export default SongSelector;

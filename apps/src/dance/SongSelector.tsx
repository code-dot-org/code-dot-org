import React, {useState, useCallback, ChangeEvent} from 'react';
import classnames from 'classnames';

import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';
import {getFilteredSongKeys} from '@cdo/apps/dance/songs';
import Button from '@cdo/apps/templates/Button';
import {SongData} from '@cdo/apps/dance/types';
import moduleStyles from '@cdo/apps/dance/song-selector.module.scss';

const commonI18n = require('@cdo/locale');

const currentTimeoutsMap: {[key: string]: ReturnType<typeof setTimeout>} = {};

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
      setSongInPreview(false);
    } else {
      audioCommands.playSound({
        url: `${songData[selectedSong].url}`,
        callback: () => {
          setSongInPreview(true);
          const timeoutID = setTimeout(() => {
            if (!levelIsRunning) {
              audioCommands.stopSound({url: songData[selectedSong].url});
              setSongInPreview(false);
            }
          }, 10000);

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
      <label>
        <b>{commonI18n.selectSong()}</b>
      </label>

      <select
        id="song_selector"
        className={moduleStyles.selectStyle}
        onChange={changeSong}
        value={selectedSong}
        disabled={!enableSongSelection}
      >
        {songKeys.map((option, i) => (
          <option key={i} value={option}>
            {songData[option].title}
          </option>
        ))}
      </select>

      <Button
        type="button"
        className={classnames(
          moduleStyles.previewSongButton,
          !levelIsRunning && songInPreview && moduleStyles.previewActiveButton
        )}
        disabled={levelIsRunning}
        color={Button.ButtonColor.neutralDark}
        icon=" fa-solid fa-play-pause"
        onClick={onPreviewBtnClick}
      />
    </div>
  );
};

export default SongSelector;

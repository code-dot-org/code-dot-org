import React, {Component, ChangeEvent} from 'react';
import {getFilteredSongKeys} from '@cdo/apps/dance/songs';
import {i18n} from '@cdo/apps/types/locale';

import styles from './SongSelector.module.scss';

interface SongData {
  title: string;
}

interface SongSelectorProps {
  enableSongSelection: boolean;
  setSong: (songId: string) => void;
  selectedSong: string | undefined;
  songData: Record<string, SongData>;
  filterOn: boolean;
}

class SongSelector extends Component<SongSelectorProps> {
  changeSong = (event: ChangeEvent<HTMLSelectElement>) => {
    const songId = event.target.value;
    this.props.setSong(songId);
  };

  render() {
    const {selectedSong, songData, enableSongSelection, filterOn} = this.props;

    const songKeys = getFilteredSongKeys(songData, filterOn);

    return (
      <div id="song-selector-wrapper">
        <label>
          <b>{i18n.selectSong()}</b>
        </label>
        <select
          id="song_selector"
          className={styles.selectStyle} // Apply the SCSS module class
          onChange={this.changeSong}
          value={selectedSong || ''}
          disabled={!enableSongSelection}
        >
          {songKeys.map((option, i) => (
            <option key={i} value={option}>
              {songData[option].title}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default SongSelector;

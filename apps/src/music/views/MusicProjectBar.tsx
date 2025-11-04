import {Typography} from '@mui/material';
import React from 'react';

import MusicLibrary from '@cdo/apps/music/player/MusicLibrary';

import {DEFAULT_PACK} from '../constants';

import styles from './music-project-bar.module.scss';

/**
 * Temporary UI for displaying information about a Music Lab project. Used in
 * Dance Party when using a Music Lab project.
 */
const MusicProjectBar: React.FC<{title: string}> = ({title}) => {
  const library = MusicLibrary.getInstance();
  if (!library) {
    return null;
  }

  const packImageUrl = library.getPackImageUrl(
    library.getCurrentPackId() || DEFAULT_PACK
  );
  const packFolder = library.getFolderForFolderId(
    library.getCurrentPackId() || DEFAULT_PACK
  );

  return (
    <div className={styles.container}>
      {packImageUrl && (
        <img
          src={packImageUrl}
          className={styles.image}
          alt={packFolder?.name}
        />
      )}
      <div className={styles.text}>
        <Typography variant="body3" gutterBottom>
          {title}
        </Typography>
        {packFolder && (
          <Typography variant="body4" gutterBottom>
            {`${packFolder.name} - ${packFolder.artist}`}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default MusicProjectBar;

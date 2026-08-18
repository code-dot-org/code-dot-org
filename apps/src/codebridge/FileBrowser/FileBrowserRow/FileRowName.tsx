import {Typography} from '@mui/material';
import React from 'react';

import {FileBrowserNameComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';

/**
 * Renders the file name for a file row in the file browser.
 */
export const FileRowName: FileBrowserNameComponentType = ({item}) => {
  return (
    <div className={moduleStyles.nameContainer}>
      <Typography variant="body4">{item.name}</Typography>
    </div>
  );
};

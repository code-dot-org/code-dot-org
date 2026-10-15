import {Typography} from '@mui/material';
import React from 'react';

import {FileBrowserNameComponentType} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';

export const FileRowName: FileBrowserNameComponentType = ({item}) => {
  return (
    <div className={moduleStyles.nameContainer}>
      <Typography variant="body4">{item.name}</Typography>
    </div>
  );
};

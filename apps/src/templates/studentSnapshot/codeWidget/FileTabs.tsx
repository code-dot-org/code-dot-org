import {ProjectFile} from '@codebridge/types';
import {Typography} from '@mui/material';
import React from 'react';

import FileTab from './FileTab';
import InstructionsTab from './InstructionsTab';
import {CodeWidgetLevelInfo, INSTRUCTIONS_TAB_ID} from './types';

import styles from './codeWidget.module.scss';

interface FileTabsProps {
  files: ProjectFile[];
  selectedFileId: string;
  onFileSelect: (fileId: string) => void;
  levelInfo?: CodeWidgetLevelInfo;
  emptyMessage?: string;
}

const FileTabs: React.FC<FileTabsProps> = ({
  files,
  selectedFileId,
  onFileSelect,
  levelInfo,
  emptyMessage = 'No files to display',
}) => {
  return (
    <div className={styles.fileTabs}>
      {levelInfo?.instructions && (
        <InstructionsTab
          isActive={selectedFileId === INSTRUCTIONS_TAB_ID}
          onClick={() => onFileSelect(INSTRUCTIONS_TAB_ID)}
        />
      )}
      {files.length === 0 && (
        <Typography
          variant="body4"
          className={styles.noStudentResponse}
          sx={{fontStyle: 'italic'}}
        >
          {emptyMessage}
        </Typography>
      )}
      {files.map(file => (
        <FileTab
          key={file.id}
          file={file}
          isActive={selectedFileId === file.id}
          onClick={() => onFileSelect(file.id)}
        />
      ))}
    </div>
  );
};

export default FileTabs;

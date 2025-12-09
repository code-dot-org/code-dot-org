import {ProjectFile} from '@codebridge/types';
import React from 'react';

import FileTab from './FileTab';

import styles from './studentCodeWidget.module.scss';

interface FileTabsProps {
  files: ProjectFile[];
  selectedFileId: string;
  onFileSelect: (fileId: string) => void;
}

const FileTabs: React.FC<FileTabsProps> = ({
  files,
  selectedFileId,
  onFileSelect,
}) => {
  return (
    <div className={styles.fileTabs}>
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

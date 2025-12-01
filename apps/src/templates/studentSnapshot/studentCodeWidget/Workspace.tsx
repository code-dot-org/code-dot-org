import {ProjectFile} from '@codebridge/types';
import React from 'react';

import Editor from './Editor';
import FileTabs from './FileTabs';

import styles from './studentCodeWidget.module.scss';

interface WorkspaceProps {
  files: ProjectFile[];
  selectedFileId: string;
  onFileSelect: (fileId: string) => void;
  theme: 'Light' | 'Dark';
}

const Workspace: React.FC<WorkspaceProps> = ({
  files,
  selectedFileId,
  onFileSelect,
  theme,
}) => {
  // Get current file code
  const currentFile = files.find(f => f.id === selectedFileId);
  const code = currentFile?.contents || '';

  return (
    <div className={styles.workspaceContainer}>
      {files.length === 0 ? (
        <Editor code={'# No code to display'} theme={theme} />
      ) : (
        <>
          {/* File tabs */}
          <FileTabs
            files={files}
            selectedFileId={selectedFileId}
            onFileSelect={onFileSelect}
          />

          {/* Code editor */}
          <Editor code={code} theme={theme} />
        </>
      )}
    </div>
  );
};

export default Workspace;

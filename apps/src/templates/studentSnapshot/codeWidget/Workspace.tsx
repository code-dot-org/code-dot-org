import {ProjectFile} from '@codebridge/types';
import React, {useMemo} from 'react';

import Editor from './Editor';
import FileTabs from './FileTabs';

import styles from './codeWidget.module.scss';

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
  const currentFile = useMemo(
    () => files.find(f => f.id === selectedFileId),
    [files, selectedFileId]
  );

  const code = useMemo(() => currentFile?.contents || '', [currentFile]);

  return (
    <div className={styles.workspaceContainer}>
      {files.length === 0 ? (
        <Editor code={'# No code to display'} theme={theme} />
      ) : (
        <>
          <FileTabs
            files={files}
            selectedFileId={selectedFileId}
            onFileSelect={onFileSelect}
          />

          <Editor code={code} theme={theme} />
        </>
      )}
    </div>
  );
};

export default Workspace;

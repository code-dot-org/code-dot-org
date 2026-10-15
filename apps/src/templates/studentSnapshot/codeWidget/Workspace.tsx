import {ProjectFile} from '@codebridge/types';
import React, {useMemo} from 'react';

import Editor from './Editor';
import FileTabs from './FileTabs';
import InstructionsPane from './InstructionsPane';
import {CodeWidgetLevelInfo, INSTRUCTIONS_TAB_ID} from './types';

import styles from './codeWidget.module.scss';

interface WorkspaceProps {
  files: ProjectFile[];
  selectedFileId: string;
  onFileSelect: (fileId: string) => void;
  theme: 'Light' | 'Dark';
  levelInfo?: CodeWidgetLevelInfo;
  emptyMessage?: string;
}

const Workspace: React.FC<WorkspaceProps> = ({
  files,
  selectedFileId,
  onFileSelect,
  theme,
  levelInfo,
  emptyMessage,
}) => {
  const currentFile = useMemo(
    () => files.find(f => f.id === selectedFileId),
    [files, selectedFileId]
  );

  const code = useMemo(() => currentFile?.contents || '', [currentFile]);
  const showInstructions = selectedFileId === INSTRUCTIONS_TAB_ID;

  return (
    <div className={styles.workspaceContainer}>
      <FileTabs
        files={files}
        selectedFileId={selectedFileId}
        onFileSelect={onFileSelect}
        levelInfo={levelInfo}
        emptyMessage={emptyMessage}
      />
      {showInstructions && levelInfo ? (
        <InstructionsPane levelInfo={levelInfo} />
      ) : (
        <Editor
          code={files.length === 0 ? '# No code to display' : code}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Workspace;

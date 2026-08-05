import {ProjectFile} from '@codebridge/types';
import {viewableImageFileType} from '@codebridge/utils/viewableImageFileType';
import React, {useEffect, useMemo, useState} from 'react';

import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import Spinner from '@cdo/apps/sharedComponents/Spinner';

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

  const isImage =
    !!currentFile?.url &&
    viewableImageFileType(getFileExtension(currentFile.name));

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentFile?.url]);

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

          {isImage ? (
            <div className={styles.imageContainer}>
              {!imageLoaded && <Spinner size="large" />}
              <img
                className={styles.imagePreview}
                src={currentFile?.url}
                alt={currentFile?.name}
                hidden={!imageLoaded}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
          ) : (
            <Editor code={code} theme={theme} />
          )}
        </>
      )}
    </div>
  );
};

export default Workspace;

import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import SwapLayoutButton from '@codebridge/SwapLayoutButton';
import {ProjectFile, ConfigType, PreviewComponent} from '@codebridge/types';
import {previewFileType} from '@codebridge/utils';
import React, {useState, useEffect} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {HTMLPreview} from './HTMLPreview';

import moduleStyles from './styles/previewContainer.module.scss';

const fileTypeMap: {
  [key: string]: PreviewComponent;
} = {
  html: HTMLPreview,
};

const getPreviewComponent = (
  previewFile: ProjectFile | undefined,
  previewComponents: ConfigType['PreviewComponents'] = {}
) => {
  if (!previewFile) {
    return () => null;
  } else if (previewComponents?.[previewFile?.language]) {
    return previewComponents?.[previewFile?.language];
  } else if (fileTypeMap[previewFile?.language]) {
    return fileTypeMap[previewFile?.language];
  } else {
    return () => (
      <div>Cannot preview files of type {previewFile?.language}</div>
    );
  }
};

export const PreviewContainer = () => {
  const {
    project: {files},
    config: {previewFileTypes, PreviewComponents},
  } = useCodebridgeContext();
  const [previewFile, setPreviewFile] = useState<ProjectFile | undefined>(
    Object.values(files).find(
      (f: ProjectFile) => f.name === 'index.html' && !f.folderId
    )
  );

  const activeFile: ProjectFile | undefined = Object.values(files).find(
    (f: ProjectFile) => f.active && previewFileType(f.language)
  ); //*/

  useEffect(() => {
    if (activeFile && previewFileType(activeFile.language, previewFileTypes)) {
      setPreviewFile(activeFile);
    }
  }, [activeFile, previewFileTypes, setPreviewFile]);

  useEffect(() => {
    if (previewFile && !files[previewFile.id]) {
      setPreviewFile(
        Object.values(files).find((f: ProjectFile) =>
          previewFileType(f.language, previewFileTypes)
        )
      );
    }
  }, [previewFile, setPreviewFile, files, previewFileTypes]);

  const PreviewComponent = getPreviewComponent(previewFile, PreviewComponents);

  const headerContent = 'HTML Preview';

  return (
    <PanelContainer
      id="editor-workspace"
      headerContent={headerContent}
      rightHeaderContent={<SwapLayoutButton />}
      className={moduleStyles.previewContainer}
    >
      <select
        onChange={e => {
          const newFile = Object.values(files).find(
            (f: ProjectFile) => f.id === e.target.value
          );
          setPreviewFile(newFile);
        }}
        value={previewFile?.id}
      >
        {(Object.values(files) as ProjectFile[])
          .sort()
          .filter(f => previewFileType(f.language, previewFileTypes))
          .map(file => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
      </select>
      {previewFile && <PreviewComponent file={previewFile} />}
    </PanelContainer>
  );
};

import {useCDOIDEContext} from '@cdoide/cdo-ide-context';
import {ProjectFileType, ConfigType, PreviewComponent} from '@cdoide/types';
import {previewFileType} from '@cdoide/utils';
import React, {useState, useEffect} from 'react';

import {HTMLPreview} from './HTMLPreview';
import {JSONPreview} from './JSONPreview';
import {JSPreview} from './JSPreview';
import './styles/right-pane.css';

const fileTypeMap: {
  [key: string]: PreviewComponent;
} = {
  html: HTMLPreview,
  js: JSPreview,
  json: JSONPreview,
};

const getPreviewComponent = (
  previewFile: ProjectFileType | undefined,
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

export const RightPane = () => {
  const {
    project: {files},
    config: {previewFileTypes, PreviewComponents},
  } = useCDOIDEContext();
  const [previewFile, setPreviewFile] = useState<ProjectFileType | undefined>(
    Object.values(files).find(
      (f: ProjectFileType) => f.name === 'index.html' && !f.folderId
    )
  );

  const activeFile: ProjectFileType | undefined = Object.values(files).find(
    (f: ProjectFileType) => f.active && previewFileType(f.language)
  ); //*/

  useEffect(() => {
    if (activeFile && previewFileType(activeFile.language, previewFileTypes)) {
      setPreviewFile(activeFile);
    }
  }, [activeFile, previewFileTypes, setPreviewFile]);

  useEffect(() => {
    if (previewFile && !files[previewFile.id]) {
      setPreviewFile(
        Object.values(files).find((f: ProjectFileType) =>
          previewFileType(f.language, previewFileTypes)
        )
      );
    }
  }, [previewFile, setPreviewFile, files, previewFileTypes]);

  const PreviewComponent = getPreviewComponent(previewFile, PreviewComponents);

  return (
    <div className="right-pane">
      <select
        onChange={e => {
          const newFile = Object.values(files).find(
            (f: ProjectFileType) => f.id === e.target.value
          );
          setPreviewFile(newFile);
        }}
        value={previewFile?.id}
      >
        {(Object.values(files) as ProjectFileType[])
          .sort()
          .filter(f => previewFileType(f.language, previewFileTypes))
          .map(file => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
      </select>
      {previewFile && <PreviewComponent file={previewFile} />}
    </div>
  );
};

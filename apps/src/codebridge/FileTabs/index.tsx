import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {sortFilesByName, shouldShowFile, getFileIcon} from '@codebridge/utils';
import React from 'react';

import './styles/fileTabs.css';
import {getActiveFileForProject} from '@cdo/apps/lab2/projects/utils';

export const FileTabs = React.memo(() => {
  const {project, closeFile, setActiveFile} = useCodebridgeContext();

  const files = sortFilesByName(project.files, {mustBeOpen: true});

  const activeFile = getActiveFileForProject(project);

  return (
    <div className="file-tabs">
      {files
        .filter(f => shouldShowFile(f))
        .map(f => {
          return (
            <div
              className={`file-tab ${
                f.active || f === activeFile ? 'active' : ''
              }`}
              key={f.id}
            >
              <span onClick={() => setActiveFile(f.id)}>
                <i className={getFileIcon(f)} />
                &nbsp;
                {f.name}
              </span>
              <button
                type="button"
                className="inline-button"
                onClick={() => closeFile(f.id)}
              >
                <i className="fa-solid fa-x" />
              </button>
            </div>
          );
        })}
    </div>
  );
});

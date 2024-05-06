import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {sortFilesByName} from '@codebridge/utils';
import React from 'react';
import './styles/fileTabs.css';

export const FileTabs = React.memo(() => {
  const {project, closeFile, setActiveFile} = useCodebridgeContext();

  const files = sortFilesByName(project.files, {mustBeOpen: true});

  return (
    <div className="file-tabs">
      {files.map(f => (
        <div className={`file-tab ${f.active ? 'active' : ''}`} key={f.id}>
          <span onClick={() => setActiveFile(f.id)}>
            <i className="fa-solid fa-file" />
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
      ))}
    </div>
  );
});

import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import {sortFilesByName} from '@cdoide/utils';
import React from 'react';
import './styles/fileNav.css';

export const FileNav = React.memo(() => {
  const {project, closeFile, setActiveFile} = useCDOIDEContext();

  const files = sortFilesByName(project.files, {mustBeOpen: true});

  return (
    <div className="files-nav-bar">
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

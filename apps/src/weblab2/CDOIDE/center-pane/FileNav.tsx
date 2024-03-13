import React from 'react';
import './styles/file-nav.css';

import {useCDOIDEContext} from '../CDOIDEContext';

type FileNavProps = {
  setActiveFile: (file: string) => void;
  closeFile: (file: string) => void;
};

export const FileNav = ({
  setActiveFile = () => undefined,
  closeFile = () => undefined,
}: FileNavProps) => {
  const {project} = useCDOIDEContext();
  const files = Object.values(project.files)
    .filter(f => f.open)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="files-nav-bar">
      {files.map(f => (
        <div className="file-tab" key={f.name} style={{cursor: 'pointer'}}>
          <span
            onClick={() => setActiveFile(f.name)}
            style={{fontWeight: f.active ? 'bold' : 'normal'}}
          >
            {f.name}
          </span>
          <span onClick={() => closeFile(f.name)}>X</span>
        </div>
      ))}
    </div>
  );
};

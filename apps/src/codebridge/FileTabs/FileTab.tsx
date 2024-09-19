import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {ProjectFile} from '@codebridge/types';
import {getFileIconName} from '@codebridge/utils';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {getActiveFileForProject} from '@cdo/apps/lab2/projects/utils';

import moduleStyles from './styles/fileTabs.module.scss';

type FileTabProps = {
  file: ProjectFile;
};

const FileTab = ({file}: FileTabProps) => {
  const {project, closeFile, setActiveFile} = useCodebridgeContext();
  const activeFile = getActiveFileForProject(project);

  return (
    <div
      className={`${moduleStyles.fileTab} ${
        file.active || file === activeFile ? moduleStyles.active : ''
      }`}
      key={file.id}
    >
      <span onClick={() => setActiveFile(file.id)}>
        <FontAwesomeV6Icon
          iconName={getFileIconName(file)!}
          iconStyle={'regular'}
        />
        &nbsp;
        {file.name}
      </span>
      <button
        type="button"
        className={moduleStyles.inlineButton}
        onClick={() => closeFile(file.id)}
      >
        <i className="fa-solid fa-x" />
      </button>
    </div>
  );
};

export default FileTab;

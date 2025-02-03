import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';

import moduleStyles from './styles/fileTabs.module.scss';

type FileTabProps = {
  file: ProjectFile;
};

const FileTab = ({file}: FileTabProps) => {
  const {source, closeFile, setActiveFile} = useCodebridgeContext();
  const activeFile = getActiveFileForSource(source);
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(file);
  const iconClassName = isBrand ? 'fa-brands' : undefined;
  const isActive = file.active || file === activeFile;
  const className = classNames(moduleStyles.fileTab, {
    [moduleStyles.active]: isActive,
  });

  return (
    <div className={className} key={file.id}>
      <div
        className={moduleStyles.label}
        onClick={() => setActiveFile(file.id)}
      >
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />
        <span>{file.name}</span>
      </div>
      <CloseButton
        onClick={() => closeFile(file.id)}
        color={'light'}
        aria-label={codebridgeI18n.closeFile()}
        className={classNames(moduleStyles.closeButton, {
          [moduleStyles.active]: isActive,
          [moduleStyles.inactive]: !isActive,
        })}
      />
    </div>
  );
};

export default FileTab;

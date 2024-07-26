import React from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  setProjectSource,
  setAndSaveProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryDropdownProps {
  versionList: ProjectVersion[];
  updatedSourceCallback?: (source: ProjectSources) => void;
  startSource: ProjectSources;
  closeDropdown: () => void;
}

const VersionHistoryDropdown: React.FunctionComponent<
  VersionHistoryDropdownProps
> = ({versionList, updatedSourceCallback, startSource, closeDropdown}) => {
  const dispatch = useAppDispatch();
  const restoreVersion = (version: ProjectVersion) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      projectManager.load(version.versionId).then(project => {
        if (project?.sources) {
          dispatch(setProjectSource(project.sources));
          if (updatedSourceCallback) {
            updatedSourceCallback(project.sources);
          }
        } else {
          // handle no source
        }
        closeDropdown();
      });
    }
  };

  const startOver = () => {
    // TODO: confirm
    dispatch(setAndSaveProjectSource(startSource));
    if (updatedSourceCallback) {
      updatedSourceCallback(startSource);
    }
    closeDropdown();
  };

  const parseDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString();
  };

  const renderVersionOptions = (version: ProjectVersion) => {
    if (version.isLatest) {
      return (
        <div className={moduleStyles.latestVersionLabel}>
          {commonI18n.latestVersion()}
        </div>
      );
    } else {
      return (
        <>
          <Button
            text={commonI18n.restore()}
            color={'white'}
            size={'s'}
            onClick={() => restoreVersion(version)}
          />
        </>
      );
    }
  };

  return (
    <div className={moduleStyles.versionHistoryList}>
      {versionList.map(version => (
        <div
          key={version.lastModified}
          className={moduleStyles.versionHistoryRow}
        >
          <div>{parseDate(version.lastModified)}</div>
          <div className={moduleStyles.versionOptions}>
            {renderVersionOptions(version)}
          </div>
        </div>
      ))}
      <div className={moduleStyles.versionHistoryRow}>
        <Button
          text={commonI18n.startOver()}
          size={'s'}
          onClick={startOver}
          color={buttonColors.destructive}
          className={moduleStyles.startOverButton}
          iconLeft={{iconStyle: 'solid', iconName: 'trash-undo'}}
        />
      </div>
    </div>
  );
};

export default VersionHistoryDropdown;

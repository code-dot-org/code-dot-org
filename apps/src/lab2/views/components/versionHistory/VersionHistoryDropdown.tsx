import React from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryDropdownProps {
  versionList: ProjectVersion[];
}

const VersionHistoryDropdown: React.FunctionComponent<
  VersionHistoryDropdownProps
> = ({versionList}) => {
  const parseDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString();
  };

  const restoreVersion = (version: ProjectVersion) => {
    console.log({version});
  };

  const startOver = () => {
    console.log('start over');
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

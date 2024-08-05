import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
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

/**
 * Dropdown that displays a list of versions for the current project.
 * Each version has a "restore" button that will restore the project to that version.
 * There is also a "start over" button that will restore the project to the start source.
 */
const VersionHistoryDropdown: React.FunctionComponent<
  VersionHistoryDropdownProps
> = ({versionList, updatedSourceCallback, startSource, closeDropdown}) => {
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const restoreVersion = useCallback(
    (version: ProjectVersion) => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      if (projectManager) {
        setLoading(true);
        setLoadError(false);
        projectManager
          .restoreSources(version.versionId)
          .then(sources => {
            if (sources) {
              dispatch(setProjectSource(sources));
              if (updatedSourceCallback) {
                updatedSourceCallback(sources);
              }
            } else {
              setLoadError(true);
            }
            setLoading(false);
            closeDropdown();
          })
          .catch(() => {
            setLoadError(true);
            setLoading(false);
          });
      }
    },
    [dispatch, updatedSourceCallback, closeDropdown]
  );

  const startOver = useCallback(() => {
    // TODO: confirm
    dispatch(setAndSaveProjectSource(startSource));
    if (updatedSourceCallback) {
      updatedSourceCallback(startSource);
    }
    closeDropdown();
  }, [dispatch, startSource, updatedSourceCallback, closeDropdown]);

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
    <div>
      <div className={moduleStyles.versionHistoryList}>
        {versionList.map(version => (
          <div
            key={version.versionId}
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
      {loading && (
        <div
          className={classNames(
            moduleStyles.loadingVersionSpinner,
            moduleStyles.versionDropdownFooter
          )}
        >
          <i className="fa fa-spinner fa-spin" />
        </div>
      )}
      {loadError && (
        <div
          className={classNames(
            moduleStyles.versionLoadError,
            moduleStyles.versionDropdownFooter
          )}
        >
          {lab2I18n.versionLoadFailure()}
        </div>
      )}
    </div>
  );
};

export default VersionHistoryDropdown;

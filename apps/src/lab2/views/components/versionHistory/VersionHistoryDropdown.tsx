import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton/CloseButton';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {
  setProjectSource,
  setAndSaveProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import currentLocale from '@cdo/apps/util/currentLocale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import VersionHistoryRow from './VersionHistoryRow';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryDropdownProps {
  versionList: ProjectVersion[];
  updatedSourceCallback?: (source: ProjectSources) => void;
  startSource: ProjectSources;
  closeDropdown: () => void;
}

const INITIAL_VERSION_ID = 'initial-version';

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
  const [selectedVersion, setSelectedVersion] = useState('');
  const locale = currentLocale();

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  useEffect(() => {
    if (selectedVersion === '') {
      setSelectedVersion(
        versionList.find(version => version.isLatest)?.versionId || ''
      );
    }
  }, [versionList, selectedVersion]);

  const dispatch = useAppDispatch();

  const startOver = useCallback(() => {
    // TODO: confirm
    dispatch(setAndSaveProjectSource(startSource));
    if (updatedSourceCallback) {
      updatedSourceCallback(startSource);
    }
    closeDropdown();
  }, [dispatch, startSource, updatedSourceCallback, closeDropdown]);

  const restoreSelectedVersion = useCallback(() => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (selectedVersion === INITIAL_VERSION_ID) {
      startOver();
    } else if (projectManager && selectedVersion) {
      setLoading(true);
      setLoadError(false);
      projectManager
        .restoreSources(selectedVersion)
        .then(sources => {
          if (sources) {
            dispatch(setProjectSource(sources));
            if (updatedSourceCallback) {
              updatedSourceCallback(sources);
            }
          } else {
            setLoadError(true);
          }
          closeDropdown();
        })
        .catch(() => {
          setLoadError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [
    selectedVersion,
    startOver,
    closeDropdown,
    dispatch,
    updatedSourceCallback,
  ]);

  const parseDate = (date: string) => {
    const dateObject = new Date(date);
    return dateFormatter.format(dateObject);
  };

  const onVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: preview this version
    setSelectedVersion(e.target.value);
  };

  return (
    <div>
      <div className={moduleStyles.versionHistoryHeader}>
        <Heading6 className={moduleStyles.versionHistoryTitle}>
          {commonI18n.versionHistory_header()}
        </Heading6>
        <CloseButton
          onClick={closeDropdown}
          aria-label={lab2I18n.closeVersionHistory()}
        />
      </div>

      <div className={moduleStyles.versionHistoryList}>
        {versionList.map(version => (
          <VersionHistoryRow
            key={version.versionId}
            versionId={version.versionId}
            versionLabel={parseDate(version.lastModified)}
            isLatest={version.isLatest}
            isSelected={selectedVersion === version.versionId}
            onChange={onVersionChange}
          />
        ))}
        <VersionHistoryRow
          key={INITIAL_VERSION_ID}
          versionId={INITIAL_VERSION_ID}
          versionLabel={lab2I18n.initialVersion()}
          isLatest={versionList.length === 0}
          isSelected={selectedVersion === INITIAL_VERSION_ID}
          onChange={onVersionChange}
        />
      </div>

      {loadError && (
        <div className={classNames(moduleStyles.versionLoadError)}>
          <Alert type="danger" text={lab2I18n.versionLoadFailure()} size="s" />
        </div>
      )}
      <div className={moduleStyles.versionDropdownFooter}>
        {loading && (
          <div className={classNames(moduleStyles.loadingVersionSpinner)}>
            <i className="fa fa-spinner fa-spin" />
          </div>
        )}
        <Button
          text={commonI18n.restore()}
          color={'purple'}
          size={'m'}
          onClick={restoreSelectedVersion}
          disabled={loading}
          className={moduleStyles.actionButton}
        />
        <Button
          text={commonI18n.cancel()}
          color={'white'}
          size={'m'}
          onClick={closeDropdown}
          disabled={loading}
          className={moduleStyles.actionButton}
        />
      </div>
    </div>
  );
};

export default VersionHistoryDropdown;

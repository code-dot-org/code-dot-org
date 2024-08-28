import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Tags from '@cdo/apps/componentLibrary/tags/Tags';
import {BodyTwoText, Heading6} from '@cdo/apps/componentLibrary/typography';
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
  const restoreSelectedVersion = useCallback(() => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager && selectedVersion) {
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
          setLoading(false);
          closeDropdown();
        })
        .catch(() => {
          setLoadError(true);
          setLoading(false);
        });
    }
  }, [dispatch, updatedSourceCallback, closeDropdown, selectedVersion]);

  const startOver = useCallback(() => {
    // TODO: confirm
    dispatch(setAndSaveProjectSource(startSource));
    if (updatedSourceCallback) {
      updatedSourceCallback(startSource);
    }
    closeDropdown();
  }, [dispatch, startSource, updatedSourceCallback, closeDropdown]);

  const parseDate = (date: string) => {
    const dateObject = new Date(date);
    return dateFormatter.format(dateObject);
  };

  const onVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('version changed!');
    console.log(e.target.value);
    setSelectedVersion(e.target.value);
  };

  return (
    <div>
      <Heading6 className={moduleStyles.versionHistoryHeader}>
        {commonI18n.versionHistory_header()}
      </Heading6>
      <div className={moduleStyles.versionHistoryList}>
        {versionList.map(version => (
          <label className={moduleStyles.versionItem} key={version.versionId}>
            <input
              type="radio"
              name={version.versionId}
              value={version.versionId}
              onChange={onVersionChange}
              checked={selectedVersion === version.versionId}
            />
            <div className={moduleStyles.versionLabel}>
              <BodyTwoText className={moduleStyles.versionDate}>
                {parseDate(version.lastModified)}
              </BodyTwoText>
              {version.isLatest && (
                <Tags
                  tagsList={[
                    {
                      label: commonI18n.current(),
                      icon: {
                        iconName: 'check',
                        iconStyle: 'regular',
                        title: 'check',
                        placement: 'left',
                      },
                      tooltipContent: commonI18n.current(),
                      tooltipId: 'current-version-tag',
                      ariaLabel: commonI18n.current(),
                    },
                  ]}
                  className={moduleStyles.currentVersionTag}
                />
              )}
            </div>
          </label>
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

      <div className={moduleStyles.versionDropdownFooter}>
        {loading && (
          <div className={classNames(moduleStyles.loadingVersionSpinner)}>
            <i className="fa fa-spinner fa-spin" />
          </div>
        )}
        {loadError && (
          <div className={classNames(moduleStyles.versionLoadError)}>
            <Alert
              type="danger"
              text={lab2I18n.versionLoadFailure()}
              size="s"
            />
          </div>
        )}
        <Button
          text={commonI18n.restore()}
          color={'purple'}
          size={'m'}
          onClick={restoreSelectedVersion}
          disabled={loading}
          className={moduleStyles.restoreButton}
        />
      </div>
    </div>
  );
};

export default VersionHistoryDropdown;

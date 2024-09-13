import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton/CloseButton';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
import {GroupedRadioButtonProps} from '@cdo/apps/componentLibrary/radioButton/RadioButtonsGroup';
import Tags from '@cdo/apps/componentLibrary/tags';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {
  setProjectSource,
  setAndSaveProjectSource,
  loadVersion,
  resetToCurrentVersion,
  setViewingOldVersion,
  setRestoredOldVersion,
  previewStartSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {commonI18n} from '@cdo/apps/types/locale';
import currentLocale from '@cdo/apps/util/currentLocale';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

//import VersionHistoryRow from './VersionHistoryRow';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryDropdownProps {
  versionList: ProjectVersion[];
  updatedSourceCallback?: (source: ProjectSources) => void;
  startSource: ProjectSources;
  closeDropdown: () => void;
  isOpen: boolean;
}

const INITIAL_VERSION_ID = 'initial-version';

/**
 * Dropdown that displays a list of versions for the current project.
 * Each version has a "restore" button that will restore the project to that version.
 * There is also a "start over" button that will restore the project to the start source.
 */
const VersionHistoryDropdown: React.FunctionComponent<
  VersionHistoryDropdownProps
> = ({
  versionList,
  updatedSourceCallback,
  startSource,
  closeDropdown,
  isOpen,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('');
  const locale = currentLocale();
  const menuRef = useOutsideClick<HTMLDivElement>(() => {
    closeDropdown();
  });
  const previousIsOpen = useRef<boolean>(isOpen);
  const latestVersion = useMemo(
    () => versionList?.find(v => v.isLatest)?.versionId || '',
    [versionList]
  );
  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );

  // If this is a teacher viewing a student's project, we hide the restore button,
  // but still allow viewing old versions.
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  const dialogControl = useDialogControl();

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  useEffect(() => {
    if (selectedVersion === '' && versionList.length > 0) {
      setSelectedVersion(latestVersion);
    }
  }, [versionList, selectedVersion, latestVersion]);

  useEffect(() => {
    if (isOpen && !previousIsOpen.current && selectedVersion !== '') {
      // We only do anything here if we just re-opened the dropdown.
      // If we are currently viewing an old version (this happens if
      // the user x'd out of the dropdown, but did not cancel), scroll to the selected version.
      // Wait a tick to ensure the selected version is rendered before scrolling to it.
      // Otherwise, reset the selected version to the latest version.
      // (we likely just restored the project to some version, so we should be viewing the latest version)
      if (viewingOldVersion) {
        setTimeout(() => {
          const selectedVersionComponent =
            document.getElementById(selectedVersion);
          if (selectedVersionComponent) {
            selectedVersionComponent.scrollIntoView({behavior: 'instant'});
          }
        }, 0);
      } else {
        setSelectedVersion(latestVersion);
      }
    }
    previousIsOpen.current = isOpen;
  }, [isOpen, selectedVersion, latestVersion, viewingOldVersion]);

  const dispatch = useAppDispatch();

  const successfulRestoreCleanUp = useCallback(
    (sources: ProjectSources) => {
      dispatch(setViewingOldVersion(false));
      dispatch(setRestoredOldVersion(true));
      if (updatedSourceCallback) {
        updatedSourceCallback(sources);
      }
    },
    [dispatch, updatedSourceCallback]
  );

  const startOver = useCallback(() => {
    // We force a new version on start over so the user doesn't lose their recent edits.
    // We also force the save to occur immediately to avoid confusion.
    dispatch(
      setAndSaveProjectSource(
        startSource,
        /* forceSave */ true,
        /* forceNewVersion */ true
      )
    );
    successfulRestoreCleanUp(startSource);
    closeDropdown();
  }, [dispatch, startSource, successfulRestoreCleanUp, closeDropdown]);

  const confirmStartOver = useCallback(() => {
    dialogControl?.showDialog({
      type: DialogType.StartOver,
      handleConfirm: startOver,
    });
  }, [dialogControl, startOver]);

  const restoreSelectedVersion = useCallback(() => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (selectedVersion === INITIAL_VERSION_ID) {
      confirmStartOver();
    } else if (projectManager && selectedVersion) {
      setLoading(true);
      setLoadError(false);
      projectManager
        .restoreSources(selectedVersion)
        .then(sources => {
          if (sources) {
            dispatch(setProjectSource(sources));
            successfulRestoreCleanUp(sources);
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
  }, [
    selectedVersion,
    confirmStartOver,
    closeDropdown,
    dispatch,
    successfulRestoreCleanUp,
  ]);

  const isLatestVersion = useCallback(
    (versionId: string) => {
      if (versionId === INITIAL_VERSION_ID) {
        return versionList.length === 0;
      }
      const version = versionList.find(
        version => version.versionId === versionId
      );
      return version && version.isLatest;
    },
    [versionList]
  );

  const parseDate = useCallback(
    (date: string) => {
      const dateObject = new Date(date);
      return dateFormatter.format(dateObject);
    },
    [dateFormatter]
  );

  const onVersionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedVersion(e.target.value);
      if (e.target.value === INITIAL_VERSION_ID) {
        console.log('previewing initial version');
        dispatch(previewStartSource({startSource}));
      } else if (isLatestVersion(e.target.value)) {
        dispatch(resetToCurrentVersion());
      } else {
        dispatch(loadVersion({versionId: e.target.value}));
      }
    },
    [dispatch, isLatestVersion, startSource]
  );

  // Function called when clicking 'cancel'. This will reset the project to the current version
  // if the user is viewing an old version, then close the dropdown.
  const handleCancel = useCallback(() => {
    // Go back to current version if we are viewing an old version
    if (
      selectedVersion === INITIAL_VERSION_ID ||
      !isLatestVersion(selectedVersion)
    ) {
      dispatch(resetToCurrentVersion());
    }
    closeDropdown();
  }, [closeDropdown, dispatch, isLatestVersion, selectedVersion]);

  const radioButtons: GroupedRadioButtonProps[] = useMemo(() => {
    const latestTag = (
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
        className={moduleStyles.latestTag}
      />
    );
    const buttons: GroupedRadioButtonProps[] = versionList.map(version => ({
      name: version.versionId,
      value: version.versionId,
      label: parseDate(version.lastModified),
      size: 'm',
      children: version.isLatest ? latestTag : undefined,
    }));
    buttons.push({
      name: INITIAL_VERSION_ID,
      value: INITIAL_VERSION_ID,
      label: lab2I18n.initialVersion(),
      size: 'm',
      children: versionList.length === 0 ? latestTag : undefined,
    });
    return buttons;
  }, [versionList, parseDate]);

  return isOpen ? (
    <div className={moduleStyles.versionHistoryDropdown} ref={menuRef}>
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
        <RadioButtonsGroup
          radioButtons={radioButtons}
          commonClassName={moduleStyles.versionHistoryRow}
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
        {!viewAsUserId && (
          <Button
            text={commonI18n.restore()}
            color={'purple'}
            size={'m'}
            onClick={restoreSelectedVersion}
            disabled={loading}
            className={moduleStyles.actionButton}
          />
        )}
        <Button
          text={commonI18n.cancel()}
          color={'white'}
          size={'m'}
          onClick={handleCancel}
          disabled={loading}
          className={moduleStyles.actionButton}
        />
      </div>
    </div>
  ) : null;
};

export default React.memo(VersionHistoryDropdown);

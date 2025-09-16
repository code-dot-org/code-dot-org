import classNames from 'classnames';
import React, {memo, useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';

import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import SettingsButton from '@cdo/apps/lab2/views/components/Settings/SettingsButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getBaseAssetUrl} from '../appConfig';
import {AnalyticsContext} from '../context';
import musicI18n from '../locale';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';

import moduleStyles from './HeaderButtons.module.scss';

interface CurrentPackProps {
  packFolder: SoundFolder;
  noRightPadding: boolean;
}

const CurrentPack: React.FunctionComponent<CurrentPackProps> = ({
  packFolder,
  noRightPadding,
}) => {
  const library = MusicLibrary.getInstance();

  let packImageSrc = null;

  if (library && packFolder) {
    const libraryGroupPath = library.getPath();
    packImageSrc =
      packFolder.imageSrc &&
      `${getBaseAssetUrl()}${libraryGroupPath}/${packFolder.path}/${
        packFolder.imageSrc
      }`;
  }

  return (
    <span className={moduleStyles.currentPack}>
      {packImageSrc && (
        <img
          src={packImageSrc}
          className={moduleStyles.buttonWideImage}
          alt=""
        />
      )}
      <span
        className={classNames(
          moduleStyles.buttonWideContent,
          noRightPadding && moduleStyles.buttonWideContentNoRightPadding
        )}
      >
        {packFolder.name} &bull; {packFolder.artist}
      </span>
    </span>
  );
};

interface HeaderButtonsProps {
  onClickUndo: () => void;
  onClickRedo: () => void;
  clearCode: () => void;
  allowPackSelection: boolean;
  skipUrl: string | undefined;
  hideChaff: () => void;
}

/**
 * A set of control buttons for the workspace header in Music Lab.
 */
const HeaderButtons: React.FunctionComponent<HeaderButtonsProps> = ({
  onClickUndo,
  onClickRedo,
  clearCode,
  allowPackSelection,
  skipUrl,
  hideChaff,
}) => {
  const readOnlyWorkspace: boolean = useSelector(isReadOnlyWorkspace);
  const canUndo = useAppSelector(state => state.music.canUndo);
  const canRedo = useAppSelector(state => state.music.canRedo);
  const currentPackId = useAppSelector(state => state.music.packId);
  const analyticsReporter = useContext(AnalyticsContext);
  const dialogControl = useDialogControl();

  const library = MusicLibrary.getInstance();

  let packFolder = null;

  if (library && currentPackId) {
    packFolder = library.getAllowedFolderForFolderId(currentPackId);
  }

  const onClickUndoRedo = useCallback(
    (action: 'undo' | 'redo') => {
      if (action === 'undo') {
        onClickUndo();
      }

      if (action === 'redo') {
        onClickRedo();
      }

      if (analyticsReporter) {
        analyticsReporter.onButtonClicked(action);
      }
    },
    [analyticsReporter, onClickRedo, onClickUndo]
  );

  const onClickStartOver = useCallback(() => {
    // Hide any custom fields that are showing.
    hideChaff();

    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.StartOver,
        handleConfirm: clearCode,
      });
    }

    if (analyticsReporter) {
      analyticsReporter.onButtonClicked('startOver');
    }
  }, [hideChaff, dialogControl, analyticsReporter, clearCode]);

  const onClickSkip = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.Skip,
        handleConfirm: () => {
          if (skipUrl) {
            window.location.href = skipUrl;
          }
        },
      });
    }
  }, [dialogControl, skipUrl]);

  const settings = useBlocklySettings();

  return (
    <div className={moduleStyles.container}>
      {!allowPackSelection && packFolder && (
        <button
          type="button"
          className={classNames(
            moduleStyles.button,
            moduleStyles.buttonWide,
            moduleStyles.buttonInteractionDisabled
          )}
          disabled={true}
        >
          <CurrentPack packFolder={packFolder} noRightPadding={true} />
        </button>
      )}
      {!readOnlyWorkspace && (
        <>
          <button
            onClick={onClickStartOver}
            type="button"
            id="start-over-button"
            className={classNames(
              moduleStyles.button,
              allowPackSelection && packFolder && moduleStyles.buttonWide,
              allowPackSelection && packFolder && moduleStyles.buttonHasBorder
            )}
          >
            {allowPackSelection && packFolder && (
              <CurrentPack packFolder={packFolder} noRightPadding={false} />
            )}
            <FontAwesome
              title={musicI18n.startOver()}
              icon="refresh"
              className={'icon'}
            />
          </button>
        </>
      )}
      {!experiments.isEnabledAllowingQueryString(
        experiments.LAB2_RESOURCE_PANEL
      ) ? (
        <SettingsButton
          settings={settings}
          className={classNames(moduleStyles.button)}
        />
      ) : null}
      {!readOnlyWorkspace && (
        <>
          <button
            onClick={() => onClickUndoRedo('undo')}
            type="button"
            className={classNames(
              moduleStyles.button,
              !canUndo && moduleStyles.buttonDisabled
            )}
            disabled={!canUndo}
          >
            <FontAwesome
              title={musicI18n.undo()}
              icon="undo"
              className={'icon'}
            />
          </button>
          <button
            onClick={() => onClickUndoRedo('redo')}
            type="button"
            className={classNames(
              moduleStyles.button,
              !canRedo && moduleStyles.buttonDisabled
            )}
            disabled={!canRedo}
          >
            <FontAwesome
              title={musicI18n.redo()}
              icon="redo"
              className={'icon'}
            />
          </button>
          {Blockly.showBlockHelp && (
            <button
              onClick={() => window.open('/docs/ide/music', '_blank')}
              type="button"
              id="documentation-button"
              className={classNames(moduleStyles.button)}
            >
              <FontAwesome
                title={musicI18n.documentation()}
                icon="book"
                className={'icon'}
              />
            </button>
          )}
        </>
      )}
      {skipUrl && (
        <button
          onClick={onClickSkip}
          type="button"
          className={classNames(moduleStyles.button, moduleStyles.buttonSkip)}
        >
          <span>{commonI18n.skipToProject()}</span>
          <FontAwesome
            title={commonI18n.skipToProject()}
            icon="arrow-right"
            className={'icon'}
          />
        </button>
      )}
    </div>
  );
};

export default memo(HeaderButtons);

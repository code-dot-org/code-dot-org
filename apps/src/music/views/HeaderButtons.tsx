import {Button} from '@code-dot-org/component-library/button';
import {
  WithTooltip,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {memo, useCallback, useContext, useRef} from 'react';
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
  const tooltipRef = useRef<WithTooltipHandle>(null);

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

  const getIconButton = (
    i18nLabel: string,
    title: string,
    icon: string,
    disabled: boolean = true,
    onClick: () => void
  ) => {
    return (
      <WithTooltip
        tooltipProps={{
          text: i18nLabel,
          direction: 'onBottom',
          tooltipId: `${title}-tooltip`,
          size: 'xs',
          hideTail: true,
        }}
        ref={tooltipRef}
      >
        <Button
          id={`${title}-button`}
          isIconOnly
          icon={{iconStyle: 'solid', iconName: icon}}
          size="xs"
          onClick={onClick}
          type="tertiary"
          ariaLabel={i18nLabel}
          color={'black'}
          disabled={disabled}
        />
      </WithTooltip>
    );
  };

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
              allowPackSelection && packFolder && moduleStyles.buttonWide
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
        <SettingsButton settings={settings} />
      ) : null}
      {!readOnlyWorkspace && (
        <>
          {/* Undo Button */}
          {getIconButton(musicI18n.undo(), 'undo', 'undo', !canUndo, () =>
            onClickUndoRedo('undo')
          )}
          {/* Redo Button */}
          {getIconButton(musicI18n.redo(), 'redo', 'redo', !canRedo, () =>
            onClickUndoRedo('redo')
          )}
          {/* Documentation Button */}
          {Blockly.showBlockHelp &&
            getIconButton(
              commonI18n.documentation(),
              'documentation',
              'book',
              false,
              () => window.open('/docs/ide/music', '_blank')
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

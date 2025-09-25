import {Button} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import Typography from '@code-dot-org/component-library/typography';
import React, {memo, useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';

import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import SettingsButton from '@cdo/apps/lab2/views/components/Settings/SettingsButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
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
}

const CurrentPack: React.FunctionComponent<CurrentPackProps> = ({
  packFolder,
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
    <div className={moduleStyles.currentPack}>
      {packImageSrc && (
        <img
          src={packImageSrc}
          className={moduleStyles.buttonWideImage}
          alt=""
        />
      )}
      <Typography semanticTag="p" visualAppearance="body-four" noMargin>
        {packFolder.name} &bull; {packFolder.artist}
      </Typography>
    </div>
  );
};

interface IconButtonProps {
  id: string;
  i18nLabel: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const IconButton: React.FunctionComponent<IconButtonProps> = memo(
  ({id, i18nLabel, icon, disabled = false, onClick, containerRef}) => {
    const handleClick = useCallback(
      (
        e:
          | React.MouseEvent<HTMLButtonElement, MouseEvent>
          | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ) => {
        onClick();
        // Adding this to prevent focus from jumping to the next button
        // and showing its tooltip when a button is disabled after click.
        // This moves focus to the container div instead.
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.focus();
          }
        }, 0);
      },
      [onClick, containerRef]
    );

    return (
      <WithTooltip
        tooltipProps={{
          tooltipId: `${id}-tooltip`,
          text: i18nLabel,
          direction: 'onBottom',
          size: 'xs',
          hideTail: true,
        }}
      >
        <Button
          id={`${id}-button`}
          ariaLabel={i18nLabel}
          type="tertiary"
          color="black"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'solid', iconName: icon}}
          disabled={disabled}
          onClick={handleClick}
        />
      </WithTooltip>
    );
  }
);

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
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const onClickDocumentation = useCallback(() => {
    window.open('/docs/ide/music', '_blank');
  }, []);

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
    <div className={moduleStyles.container} ref={containerRef} tabIndex={-1}>
      {/* Show static pack info; clickable Start Over button */}
      {!allowPackSelection && packFolder && (
        <>
          <CurrentPack packFolder={packFolder} />
          {/* Start Over Button */}
          <IconButton
            id="start-over"
            i18nLabel={musicI18n.startOver()}
            icon="refresh"
            onClick={onClickStartOver}
            containerRef={containerRef}
          />
        </>
      )}
      {/* Show clickable pack info with Start Over icon */}
      {!readOnlyWorkspace && allowPackSelection && (
        <>
          <button
            onClick={onClickStartOver}
            type="button"
            id="start-over-button"
            className={moduleStyles.buttonWithPack}
          >
            {packFolder && <CurrentPack packFolder={packFolder} />}
            <FontAwesomeV6Icon iconName="refresh" iconStyle="solid" />
          </button>
        </>
      )}
      {/* Settings Button */}
      {!experiments.isEnabledAllowingQueryString(
        experiments.LAB2_RESOURCE_PANEL
      ) ? (
        <SettingsButton settings={settings} />
      ) : null}
      {!readOnlyWorkspace && (
        <>
          {/* Undo Button */}
          <IconButton
            id="undo"
            i18nLabel={musicI18n.undo()}
            icon="undo"
            disabled={!canUndo}
            onClick={() => onClickUndoRedo('undo')}
            containerRef={containerRef}
          />
          {/* Redo Button */}
          <IconButton
            id="redo"
            i18nLabel={musicI18n.redo()}
            icon="redo"
            disabled={!canRedo}
            onClick={() => onClickUndoRedo('redo')}
            containerRef={containerRef}
          />
          {/* Documentation Button */}
          {Blockly.showBlockHelp && (
            <IconButton
              id="documentation"
              i18nLabel={musicI18n.documentation()}
              icon="book"
              onClick={onClickDocumentation}
              containerRef={containerRef}
            />
          )}
        </>
      )}
      {/* Skip to Project Button */}
      {skipUrl && (
        <Button
          text={commonI18n.skipToProject()}
          type="tertiary"
          color="black"
          size="xs"
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right'}}
          onClick={onClickSkip}
        />
      )}
    </div>
  );
};

export default memo(HeaderButtons);

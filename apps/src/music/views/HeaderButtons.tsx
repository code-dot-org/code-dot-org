import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {memo, useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';

import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getBaseAssetUrl} from '../appConfig';
import {AnalyticsContext} from '../context';
import musicI18n from '../locale';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';

import moduleStyles from './HeaderButtons.module.scss';

const REMOVED_PACK_ICON_ID = 'removed-pack-icon';

interface CurrentPackProps extends React.HTMLAttributes<HTMLDivElement> {
  packFolder: SoundFolder;
}

// Forwards its ref and props so a Tooltip can attach its listeners.
const CurrentPack = React.forwardRef<HTMLDivElement, CurrentPackProps>(
  ({packFolder, className, ...props}, ref) => {
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
      <div
        {...props}
        ref={ref}
        data-notranslate
        className={classNames(
          className,
          moduleStyles.currentPack,
          packFolder.removed && moduleStyles.currentPackRemoved
        )}
      >
        {packFolder.removed && (
          <FontAwesomeV6Icon
            id={REMOVED_PACK_ICON_ID}
            iconName="exclamation-circle"
            iconStyle="solid"
          />
        )}
        {packImageSrc && (
          <img
            src={packImageSrc}
            className={moduleStyles.buttonWideImage}
            alt=""
          />
        )}
        <Typography variant="body4">
          {packFolder.name} &bull; {packFolder.artist}
        </Typography>
      </div>
    );
  }
);
CurrentPack.displayName = 'CurrentPack';

interface RemovedPackTooltipProps {
  packFolder: SoundFolder | null;
  children: React.ReactElement;
}

const RemovedPackTooltip: React.FunctionComponent<RemovedPackTooltipProps> = ({
  packFolder,
  children,
}) => {
  // The bubble portals to <body>, so it cannot inherit data-theme.
  const {theme} = useTheme(true);

  if (!packFolder?.removed) {
    return children;
  }

  return (
    <Tooltip
      title={musicI18n.packRemovedDescription()}
      placement="bottom"
      describeChild
      slotProps={{
        tooltip: theme ? {'data-theme': theme} : {},
        // Hovering anywhere on the children opens it, but it points at the info icon.
        popper: {
          anchorEl: () => document.getElementById(REMOVED_PACK_ICON_ID),
          // The icon sits inside the button, so clear the button's bottom edge.
          modifiers: [{name: 'offset', options: {offset: [0, 8]}}],
        },
      }}
    >
      {children}
    </Tooltip>
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

  return (
    <div className={moduleStyles.container} ref={containerRef} tabIndex={-1}>
      {/* Show static pack information. */}
      {!allowPackSelection && packFolder && (
        <RemovedPackTooltip packFolder={packFolder}>
          {/* Focusable so keyboard users can open the tooltip. */}
          <CurrentPack
            packFolder={packFolder}
            tabIndex={packFolder.removed ? 0 : undefined}
          />
        </RemovedPackTooltip>
      )}
      {/* Show Start Over button, possibly with pack information inside it. */}
      {!readOnlyWorkspace && (
        <>
          <RemovedPackTooltip
            packFolder={allowPackSelection ? packFolder : null}
          >
            <button
              onClick={onClickStartOver}
              type="button"
              id="start-over-button"
              className={classNames(
                moduleStyles.startOverButton,
                allowPackSelection &&
                  packFolder &&
                  moduleStyles.startOverButtonWithPack
              )}
            >
              {allowPackSelection && packFolder && (
                <CurrentPack packFolder={packFolder} />
              )}
              <FontAwesomeV6Icon iconName="refresh" iconStyle="solid" />
            </button>
          </RemovedPackTooltip>
        </>
      )}
      {!readOnlyWorkspace && (
        <>
          {/* Undo button. */}
          <IconButtonWithTooltip
            id="undo"
            label={musicI18n.undo()}
            icon={{iconName: 'undo', iconStyle: 'solid'}}
            variant="text"
            color="secondary"
            size="extraSmall"
            tooltipDirection="onBottom"
            hideTooltipTail={true}
            disabled={!canUndo}
            onClick={() => onClickUndoRedo('undo')}
            containerRef={containerRef}
          />
          {/* Redo button. */}
          <IconButtonWithTooltip
            id="redo"
            label={musicI18n.redo()}
            icon={{iconName: 'redo', iconStyle: 'solid'}}
            variant="text"
            color="secondary"
            size="extraSmall"
            tooltipDirection="onBottom"
            hideTooltipTail={true}
            disabled={!canRedo}
            onClick={() => onClickUndoRedo('redo')}
            containerRef={containerRef}
          />
        </>
      )}
      {/* Skip to Project button. */}
      {skipUrl && (
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          onClick={onClickSkip}
          type="button"
          endIcon={
            <FontAwesomeV6Icon iconStyle="solid" iconName="arrow-right" />
          }
        >
          {commonI18n.skipToProject()}
        </MuiButton>
      )}
    </div>
  );
};

export default memo(HeaderButtons);

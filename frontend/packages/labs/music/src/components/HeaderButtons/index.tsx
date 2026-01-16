import {Button} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Typography from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import {memo, useCallback, useContext, useRef} from 'react';
import {useSelector} from 'react-redux';

import {labActions} from '@code-dot-org/lab/redux';
import {IconButtonWithTooltip} from '@code-dot-org/lab';
import {useDialogControl} from '@code-dot-org/lab/contexts';
import {DialogType} from '@code-dot-org/lab/dialogs';
import {useAppSelector} from '../../redux/store';

import {getBaseAssetUrl} from '../../appConfig';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import type {SoundFolder} from '../../player/MusicLibrary';
import MusicLibrary from '../../player/MusicLibrary';

import moduleStyles from './headerButtons.module.scss';

export interface CurrentPackProps {
  packFolder: SoundFolder;
}

export const CurrentPack = ({packFolder}: CurrentPackProps) => {
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
    <div data-notranslate className={moduleStyles.currentPack}>
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

export interface HeaderButtonsProps {
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
const HeaderButtons = ({
  onClickUndo,
  onClickRedo,
  clearCode,
  allowPackSelection,
  skipUrl,
  hideChaff,
}: HeaderButtonsProps) => {
  const readOnlyWorkspace: boolean = useSelector(
    labActions.isReadOnlyWorkspace,
  );
  const canUndo = useAppSelector(state => state.music.canUndo);
  const canRedo = useAppSelector(state => state.music.canRedo);
  const currentPackId = useAppSelector(state => state.music.packId);
  const analyticsReporter = useContext(AnalyticsContext);
  const dialogControl = useDialogControl();
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    [analyticsReporter, onClickRedo, onClickUndo],
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
        <CurrentPack packFolder={packFolder} />
      )}
      {/* Show Start Over button, possibly with pack information inside it. */}
      {!readOnlyWorkspace && (
        <>
          <button
            onClick={onClickStartOver}
            type="button"
            id="start-over-button"
            className={classNames(
              moduleStyles.startOverButton,
              allowPackSelection &&
                packFolder &&
                moduleStyles.startOverButtonWithPack,
            )}
          >
            {allowPackSelection && packFolder && (
              <CurrentPack packFolder={packFolder} />
            )}
            <FontAwesomeV6Icon iconName="refresh" iconStyle="solid" />
          </button>
        </>
      )}
      {!readOnlyWorkspace && (
        <>
          {/* Undo button. */}
          <IconButtonWithTooltip
            id="undo"
            label="Undo"
            icon={{iconName: 'undo', iconStyle: 'solid'}}
            type="tertiary"
            color="black"
            buttonSize="xs"
            tooltipSize="xs"
            tooltipDirection="onBottom"
            hideTooltipTail={true}
            disabled={!canUndo}
            onClick={() => onClickUndoRedo('undo')}
            containerRef={containerRef}
          />
          {/* Redo button. */}
          <IconButtonWithTooltip
            id="redo"
            label="Redo"
            icon={{iconName: 'redo', iconStyle: 'solid'}}
            type="tertiary"
            color="black"
            buttonSize="xs"
            tooltipSize="xs"
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
        <Button
          text="Skip to project"
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

import classNames from 'classnames';
import React, {useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';

import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getBaseAssetUrl} from '../appConfig';
import {AnalyticsContext} from '../context';
import musicI18n from '../locale';
import MusicLibrary, {SoundFolder} from '../player/MusicLibrary';
import {MusicState} from '../redux/musicRedux';

import moduleStyles from './HeaderButtons.module.scss';

interface CurrentPackProps {
  packFolder: SoundFolder;
  noRightPadding: boolean;
}

const TEACHER_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSflGeMmY_ff1QllJfpTsWGZdn_xv6dKpPba_evTMwfbvG3FTA/viewform';
const STUDENT_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSeZGNgX4wDvA29stId_Q2toofJN-r12zSP8yBMZ-E9KW5XPWg/viewform';

const useFeedbackLink = () => {
  const {userType, signInState} = useAppSelector(state => state.currentUser);
  const isSignedIn = signInState === SignInState.SignedIn;
  const feedbackLink =
    userType === 'teacher' ? TEACHER_FEEDBACK_LINK : STUDENT_FEEDBACK_LINK;
  return {isSignedIn, feedbackLink};
};

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
  const {canUndo, canRedo} = useSelector(
    (state: {music: MusicState}) => state.music.undoStatus
  );
  const currentPackId = useAppSelector(state => state.music.packId);
  const analyticsReporter = useContext(AnalyticsContext);
  const dialogControl = useDialogControl();
  const {isSignedIn, feedbackLink} = useFeedbackLink();

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
    <div className={moduleStyles.container}>
      <div className={moduleStyles.subContainer}>
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
            {isSignedIn && (
              <button
                onClick={() => window.open(feedbackLink, '_blank')}
                type="button"
                className={classNames(moduleStyles.button)}
              >
                <FontAwesome
                  title={musicI18n.feedback()}
                  icon="commenting"
                  className={'icon'}
                />
              </button>
            )}
          </>
        )}
      </div>
      {skipUrl && (
        <button
          onClick={onClickSkip}
          type="button"
          className={classNames(moduleStyles.button, moduleStyles.buttonSkip)}
        >
          {commonI18n.skipToProject()}
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

export default HeaderButtons;

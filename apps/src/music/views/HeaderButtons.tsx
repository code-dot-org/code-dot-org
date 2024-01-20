import {
  DialogContext,
  DialogType,
} from '@cdo/apps/lab2/views/dialogs/DialogManager';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import React, {useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';
import {AnalyticsContext} from '../context';
import {MusicState} from '../redux/musicRedux';
import moduleStyles from './undo-redo-buttons.module.scss';

interface HeaderButtonsProps {
  onClickUndo: () => void;
  onClickRedo: () => void;
  clearCode: () => void;
}

/**
 * A set of control buttons for the workspace header in Music Lab.
 */
const HeaderButtons: React.FunctionComponent<HeaderButtonsProps> = ({
  onClickUndo,
  onClickRedo,
  clearCode,
}) => {
  const {canUndo, canRedo} = useSelector(
    (state: {music: MusicState}) => state.music.undoStatus
  );
  const analyticsReporter = useContext(AnalyticsContext);
  const dialogControl = useContext(DialogContext);

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
    if (dialogControl) {
      dialogControl.showDialog(DialogType.StartOver, clearCode);
    }

    if (analyticsReporter) {
      analyticsReporter.onButtonClicked('startOver');
    }
  }, [dialogControl, analyticsReporter, clearCode]);

  const onFeedbackClicked = () => {
    if (analyticsReporter) {
      analyticsReporter.onButtonClicked('feedback');
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLScnUgehPPNjhSNIcCpRMcHFgtE72TlfTOh6GkER6aJ-FtIwTQ/viewform?usp=sf_link',
        '_blank'
      );
    }
  };

  return (
    <div className={moduleStyles.container}>
      <button
        onClick={onClickStartOver}
        type="button"
        className={classNames(moduleStyles.button)}
      >
        <FontAwesome title={undefined} icon="refresh" className={'icon'} />
      </button>
      <button
        onClick={() => onClickUndoRedo('undo')}
        type="button"
        className={classNames(
          moduleStyles.button,
          !canUndo && moduleStyles.buttonDisabled
        )}
      >
        <FontAwesome title={undefined} icon="undo" className={'icon'} />
      </button>
      <button
        onClick={() => onClickUndoRedo('redo')}
        type="button"
        className={classNames(
          moduleStyles.button,
          !canRedo && moduleStyles.buttonDisabled
        )}
      >
        <FontAwesome title={undefined} icon="redo" className={'icon'} />
      </button>
      <button
        onClick={onFeedbackClicked}
        type="button"
        className={classNames(moduleStyles.button)}
      >
        <FontAwesome title={undefined} icon="commenting" className={'icon'} />
      </button>
    </div>
  );
};

export default HeaderButtons;

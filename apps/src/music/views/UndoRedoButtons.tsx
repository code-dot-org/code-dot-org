import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import React, {useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';
import {AnalyticsContext} from '../context';
import {MusicState} from '../redux/musicRedux';
import moduleStyles from './undo-redo-buttons.module.scss';

interface UndoRedoButtonsProps {
  onClickUndo: () => void;
  onClickRedo: () => void;
}

/**
 * A set of undo and redo buttons for Music Lab. Can be disabled based on
 * the undo status in the music redux store.
 */
const UndoRedoButtons: React.FunctionComponent<UndoRedoButtonsProps> = ({
  onClickUndo,
  onClickRedo,
}) => {
  const {canUndo, canRedo} = useSelector(
    (state: {music: MusicState}) => state.music.undoStatus
  );
  const analyticsReporter = useContext(AnalyticsContext);

  const clickHandler = useCallback(
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

  return (
    <div className={moduleStyles.container}>
      <button
        onClick={() => clickHandler('undo')}
        type="button"
        className={classNames(
          moduleStyles.button,
          !canUndo && moduleStyles.buttonDisabled
        )}
      >
        <FontAwesome title={undefined} icon="undo" className={'icon'} />
      </button>
      <button
        onClick={() => clickHandler('redo')}
        type="button"
        className={classNames(
          moduleStyles.button,
          !canRedo && moduleStyles.buttonDisabled
        )}
      >
        <FontAwesome title={undefined} icon="redo" className={'icon'} />
      </button>
    </div>
  );
};

export default UndoRedoButtons;

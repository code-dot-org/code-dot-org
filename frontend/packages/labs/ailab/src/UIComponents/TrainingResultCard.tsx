import {Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {formatAccuracy} from '../helpers/accuracy';
import {hasCurrentTrainingResult} from '../helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setCurrentPanel, setTrainingModalStep} from '../redux';
import {getDisplayTree} from '../selectors/visualizationSelectors';

import TreeMiniMap from './TreeMiniMap';

import styles from './trainingResultCard.module.scss';

const TrainingResultCard = () => {
  const dispatch = useAppDispatch();
  const hasResult = useAppSelector(hasCurrentTrainingResult);
  const isModalOpen = useAppSelector(state => !!state.trainingModalStep);
  const latestResult = useAppSelector(state => state.historicResults[0]);
  const tree = useAppSelector(getDisplayTree);
  const [isReplaying, setIsReplaying] = useState(false);
  const testButton = useRef<HTMLButtonElement>(null);
  const isVisible = hasResult && (!isModalOpen || isReplaying);

  useEffect(() => {
    if (!isModalOpen) {
      setIsReplaying(false);
    }
  }, [isModalOpen]);

  // The card replaces the Train model button, which previously received focus.
  useEffect(() => {
    if (isVisible && document.activeElement === document.body) {
      testButton.current?.focus();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const {accuracy, correct, total} = latestResult;

  const replayTraining = () => {
    setIsReplaying(true);
    dispatch(setTrainingModalStep('training'));
  };

  return (
    <div className={styles.card}>
      {tree && <TreeMiniMap tree={tree} onReplay={replayTraining} />}
      <div className={styles.results}>
        <div className={styles.result}>
          <Typography variant="body4" className={styles.label}>
            Accuracy
          </Typography>
          <Typography variant="body2" className={styles.value}>
            {formatAccuracy(accuracy)}
          </Typography>
        </div>
        <div className={styles.result}>
          <Typography variant="body4" className={styles.label}>
            Number correct
          </Typography>
          <Typography variant="body2" className={styles.value}>
            {correct}/{total}
          </Typography>
        </div>
      </div>
      <div className={styles.actionRow}>
        <Button
          ref={testButton}
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          endIcon={
            <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
          }
          onClick={() => dispatch(setCurrentPanel('results'))}
        >
          Test model
        </Button>
      </div>
    </div>
  );
};

export default TrainingResultCard;

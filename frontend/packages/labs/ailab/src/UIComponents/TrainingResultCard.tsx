import {Button, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {formatAccuracy} from '../helpers/accuracy';
import {isTrainedOnCurrentColumns} from '../helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setCurrentPanel, setTrainingModalStep} from '../redux';
import {getDisplayTree} from '../selectors/visualizationSelectors';

import TreeMiniMap from './TreeMiniMap';

import styles from './trainingResultCard.module.scss';

const TrainingResultCard = () => {
  const dispatch = useAppDispatch();
  const isTrained = useAppSelector(isTrainedOnCurrentColumns);
  const isModalOpen = useAppSelector(state => !!state.trainingModalStep);
  const latestResult = useAppSelector(state => state.historicResults[0]);
  const tree = useAppSelector(getDisplayTree);
  // A replay keeps the card mounted, so the dialog can return focus to it.
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      setIsReplaying(false);
    }
  }, [isModalOpen]);

  if (!isTrained || (isModalOpen && !isReplaying) || latestResult.total === 0) {
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

/* Results of the latest training, while the Train panel still matches it. */
import {Typography} from '@mui/material';

import {getCorrectCount} from '../helpers/accuracy';
import {isTrainedOnCurrentColumns} from '../helpers/navigationValidation';
import {shallowEqual, useAppSelector} from '../hooks';

import styles from './trainingResultCard.module.scss';

const TrainingResultCard = () => {
  const isTrained = useAppSelector(isTrainedOnCurrentColumns);
  // Keeps the result hidden behind the training animation.
  const isModalOpen = useAppSelector(state => !!state.trainingModalStep);
  const {correct, total} = useAppSelector(getCorrectCount, shallowEqual);

  if (!isTrained || isModalOpen || total === 0) {
    return null;
  }

  const percentCorrect = Math.round((correct / total) * 100);

  return (
    <dl className={styles.card}>
      <div className={styles.result}>
        <Typography component="dt" variant="body4" className={styles.label}>
          Accuracy
        </Typography>
        <Typography
          component="dd"
          variant="body2"
          className={styles.accuracyValue}
        >
          {percentCorrect}%
        </Typography>
      </div>
      <div className={styles.result}>
        <Typography component="dt" variant="body4" className={styles.label}>
          Number correct
        </Typography>
        <Typography component="dd" variant="body2" className={styles.value}>
          {correct}/{total}
        </Typography>
      </div>
    </dl>
  );
};

export default TrainingResultCard;

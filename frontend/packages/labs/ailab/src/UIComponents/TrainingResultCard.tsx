import {Button, Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {getCorrectCount} from '../helpers/accuracy';
import {isTrainedOnCurrentColumns} from '../helpers/navigationValidation';
import {shallowEqual, useAppDispatch, useAppSelector} from '../hooks';
import {setCurrentPanel} from '../redux';

import styles from './trainingResultCard.module.scss';

const TrainingResultCard = () => {
  const dispatch = useAppDispatch();
  const isTrained = useAppSelector(isTrainedOnCurrentColumns);
  const isModalOpen = useAppSelector(state => !!state.trainingModalStep);
  const {correct, total} = useAppSelector(getCorrectCount, shallowEqual);

  if (!isTrained || isModalOpen || total === 0) {
    return null;
  }

  const percentCorrect = Math.round((correct / total) * 100);

  return (
    <div className={styles.card}>
      <div className={styles.results}>
        <div className={styles.result}>
          <Typography variant="body4" className={styles.label}>
            Accuracy
          </Typography>
          <Typography variant="body2" className={styles.accuracyValue}>
            {percentCorrect}%
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

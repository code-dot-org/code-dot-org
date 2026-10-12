import {Button, Typography} from '@mui/material';
import {useEffect, useRef} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {formatAccuracy} from '../helpers/accuracy';
import {hasCurrentTrainingResult} from '../helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {replayTraining, setCurrentPanel} from '../redux';
import {
  getDisplayTree,
  getDisplayTreeCounts,
} from '../selectors/visualizationSelectors';
import {useTrainingData} from '../TrainingDataContext';

import TreeMiniMap from './TreeMiniMap';

import styles from './trainingResultCard.module.scss';

const TrainingResultCard = () => {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const hasResult = useAppSelector(state =>
    hasCurrentTrainingResult(state, project),
  );
  const isModalOpen = useAppSelector(state => !!state.trainingModalStep);
  const latestResult = project.historicResults[0];
  const {trainedModel} = useTrainingData();
  const tree = useAppSelector(state => getDisplayTree(state, trainedModel));
  const counts = useAppSelector(state =>
    getDisplayTreeCounts(state, trainedModel),
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const isReplaying = useAppSelector(state => state.isTrainingReplay);
  const testButton = useRef<HTMLButtonElement>(null);
  const isVisible = hasResult && (!isModalOpen || isReplaying);

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

  return (
    <div className={styles.card}>
      {tree && (
        <TreeMiniMap
          tree={tree}
          datasetId={datasetId}
          counts={counts}
          onReplay={() => dispatch(replayTraining())}
        />
      )}
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

/* Modal that animates training, then testing, a newly trained model. */
import {Button, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setCurrentPanel, setTrainingModalStep} from '../redux';
import train from '../train';
import {useTrainingData} from '../TrainingDataContext';

import GenerateResults from './GenerateResults';
import TrainModel from './TrainModel';

import appStyles from '../app.module.scss';
import styles from './trainingModal.module.scss';

const TITLE_ID = 'training-modal-title';

const TrainingModal = () => {
  const dispatch = useAppDispatch();
  const step = useAppSelector(state => state.trainingModalStep);
  const isReplay = useAppSelector(state => state.isTrainingReplay);
  const [testingFinished, setTestingFinished] = useState(false);
  const {restoreTrainedModel} = useTrainingData();

  // This component stays mounted between runs, so each run starts over.
  useEffect(() => {
    if (step === 'training') {
      setTestingFinished(false);
    }
  }, [step]);

  if (!step) {
    return null;
  }

  const isTraining = step === 'training';
  const isInProgress = !isReplay && (isTraining || !testingFinished);
  const closeModal = () => {
    if (isInProgress) {
      train.cancel();
      restoreTrainedModel();
    }
    dispatch(setTrainingModalStep(undefined));
  };
  const showTesting = () => dispatch(setTrainingModalStep('testing'));
  const showResults = () => dispatch(setCurrentPanel('results'));
  const cancelLabel = isTraining ? 'Cancel Training' : 'Cancel Testing';

  return (
    <CustomDialog
      className={styles.dialog}
      aria-labelledby={TITLE_ID}
      onClose={closeModal}
      closeLabel={isInProgress ? cancelLabel : 'Close'}
    >
      <div className={styles.titleRow}>
        <Typography
          id={TITLE_ID}
          variant="h3"
          component="h2"
          // Announces the switch to testing, which happens on its own.
          aria-live="polite"
        >
          {isTraining ? 'Training your model' : 'Testing your model'}
        </Typography>
      </div>
      <p id="dsco-dialog-description" className={appStyles.visuallyHidden}>
        {I18n.t(
          isTraining
            ? 'animationDescriptionsTraining'
            : 'animationDescriptionsTesting',
        )}
      </p>
      <div className={styles.content}>
        {isTraining ? (
          <TrainModel onFinished={showTesting} />
        ) : (
          <GenerateResults onFinished={() => setTestingFinished(true)} />
        )}
      </div>
      <div className={styles.actionRow}>
        <Button variant="outlined" color="secondary" onClick={closeModal}>
          {isInProgress ? 'Cancel' : 'Back to dataset'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={isTraining ? showTesting : showResults}
          endIcon={
            <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
          }
        >
          {!isTraining && testingFinished ? 'Continue' : 'Skip'}
        </Button>
      </div>
    </CustomDialog>
  );
};

export default TrainingModal;

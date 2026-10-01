/* Modal that animates training, then testing, a newly trained model. */
import {Button, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {reportPanelView} from '../helpers/metrics';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setCurrentPanel, setTrainingModalStep} from '../redux';

import GenerateResults from './GenerateResults';
import TrainModel from './TrainModel';

import appStyles from '../app.module.scss';
import styles from './trainingModal.module.scss';

const TITLE_ID = 'training-modal-title';

const TrainingModal = () => {
  const dispatch = useAppDispatch();
  const step = useAppSelector(state => state.trainingModalStep);
  const [testingFinished, setTestingFinished] = useState(false);

  // These steps used to be panels; keep reporting them as panel views.
  useEffect(() => {
    if (step) {
      reportPanelView(step === 'training' ? 'trainModel' : 'generateResults');
    }
  }, [step]);

  if (!step) {
    return null;
  }

  const isTraining = step === 'training';
  const closeModal = () => dispatch(setTrainingModalStep(undefined));
  const showResults = () => dispatch(setCurrentPanel('results'));

  return (
    <MuiCustomDialog
      className={styles.dialog}
      aria-labelledby={TITLE_ID}
      onClose={closeModal}
      closeLabel="Close"
    >
      <div className={styles.titleRow}>
        <Typography id={TITLE_ID} variant="h3" component="h2">
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
          <TrainModel
            onFinished={() => dispatch(setTrainingModalStep('testing'))}
          />
        ) : (
          <GenerateResults onFinished={() => setTestingFinished(true)} />
        )}
      </div>
      <div className={styles.actionRow}>
        <Button variant="outlined" color="secondary" onClick={closeModal}>
          Back to dataset
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={showResults}
          endIcon={
            <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
          }
        >
          {testingFinished ? 'Continue' : 'Skip'}
        </Button>
      </div>
    </MuiCustomDialog>
  );
};

export default TrainingModal;

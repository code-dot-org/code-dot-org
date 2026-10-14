import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button} from '@mui/material';
import {useState} from 'react';

import {formatAccuracy} from '../helpers/accuracy';
import {useProject} from '../ProjectContext';

import PredictionSentence from './PredictionSentence';
import ResultsModal, {type ResultsModalTab} from './ResultsModal';

import styles from './resultsBar.module.scss';

const ResultsBar = () => {
  const {project} = useProject();
  const currentResult = project.historicResults[0];
  const [openTab, setOpenTab] = useState<ResultsModalTab>();

  if (!currentResult) {
    return null;
  }

  const accuracy = formatAccuracy(currentResult.accuracy);

  return (
    <>
      <div className={styles.bar}>
        <PredictionSentence
          label={currentResult.label}
          features={currentResult.features}
          size="m"
          singleLine
          className={styles.sentence}
        />
        <div className={styles.buttons}>
          <Button
            id="uitest-details-button"
            variant="outlined"
            color="secondary"
            size="extraSmall"
            className={styles.accuracyButton}
            aria-label={`View ${accuracy} Accuracy details`}
            onClick={() => setOpenTab('scorecard')}
          >
            <span className={styles.accuracyIcon}>
              <FontAwesomeV6Icon iconName="calculator" />
            </span>
            <span className={styles.accuracyText}>{accuracy} Accuracy</span>
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="extraSmall"
            startIcon={
              <FontAwesomeV6Icon
                iconName="clock-rotate-left"
                aria-hidden="true"
              />
            }
            onClick={() => setOpenTab('allResults')}
          >
            All results
          </Button>
        </div>
      </div>
      {openTab && (
        <ResultsModal
          initialTab={openTab}
          onClose={() => setOpenTab(undefined)}
        />
      )}
    </>
  );
};

export default ResultsBar;

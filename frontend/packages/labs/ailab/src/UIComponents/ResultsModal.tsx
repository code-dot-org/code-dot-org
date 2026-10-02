/* How the current model did, and how it compares with the models before it. */
import {Button, Typography} from '@mui/material';
import {useId} from 'react';

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import Tabs from '@code-dot-org/component-library/tabs';

import PreviousResults from './PreviousResults';
import ResultsDetails from './ResultsDetails';

import appStyles from '../app.module.scss';
import styles from './resultsModal.module.scss';

export type ResultsModalTab = 'scorecard' | 'previousResults';

interface ResultsModalProps {
  initialTab: ResultsModalTab;
  onClose: () => void;
}

const ResultsModal = ({initialTab, onClose}: ResultsModalProps) => {
  const titleId = useId();

  return (
    <MuiCustomDialog
      aria-labelledby={titleId}
      closeLabel="Close results"
      className={styles.dialog}
      onClose={onClose}
    >
      <div className={styles.titleRow}>
        <Typography id={titleId} variant="h3" component="h2">
          Results
        </Typography>
      </div>
      <p id="dsco-dialog-description" className={appStyles.visuallyHidden}>
        How your model did, and how it compares with the models you trained
        before it.
      </p>
      <Tabs
        name="ailab-results"
        type="secondary"
        defaultSelectedTabValue={initialTab}
        onChange={() => {}}
        tabsContainerClassName={styles.tabRow}
        tabPanelsContainerClassName={styles.panels}
        tabs={[
          {
            value: 'scorecard',
            text: 'Scorecard',
            tabContent: <ResultsDetails />,
          },
          {
            value: 'previousResults',
            text: 'Previous results',
            tabContent: <PreviousResults />,
          },
        ]}
      />
      <div className={styles.actionRow}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Back to Testing
        </Button>
      </div>
    </MuiCustomDialog>
  );
};

export default ResultsModal;

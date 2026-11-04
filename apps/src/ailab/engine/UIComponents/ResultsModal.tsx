import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import Tabs from '@code-dot-org/component-library/tabs';
import {Button, Typography} from '@mui/material';
import React, {useEffect, useId, useRef} from 'react';

import AllResults from './AllResults';
import ResultsDetails from './ResultsDetails';

import styles from './resultsModal.module.scss';
import appStyles from '../app.module.scss';

export type ResultsModalTab = 'scorecard' | 'allResults';

interface ResultsModalProps {
  initialTab: ResultsModalTab;
  onClose: () => void;
}

const ResultsModal = ({initialTab, onClose}: ResultsModalProps) => {
  const titleId = useId();
  const titleRowRef = useRef<HTMLDivElement>(null);

  // MuiCustomDialog has already focused the first tab, selected or not.
  useEffect(() => {
    titleRowRef.current
      ?.closest('[role="dialog"]')
      ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      ?.focus();
  }, []);

  return (
    <MuiCustomDialog
      aria-labelledby={titleId}
      closeLabel="Close results"
      className={styles.dialog}
      onClose={onClose}
    >
      <div ref={titleRowRef} className={styles.titleRow}>
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
            value: 'allResults',
            text: 'All results',
            tabContent: <AllResults />,
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

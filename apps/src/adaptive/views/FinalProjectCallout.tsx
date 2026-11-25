// Callout anchored below the "My project" tab, shown the first time the
// student returns to the skill map after completing every checkpoint.

import React from 'react';

import Callout from './Callout';

import styles from './finalProjectCallout.module.scss';

interface FinalProjectCalloutProps {
  onDismiss: () => void;
}

const FinalProjectCallout: React.FunctionComponent<
  FinalProjectCalloutProps
> = ({onDismiss}) => (
  <Callout
    className={styles.callout}
    align="start"
    title="Keep working on your project"
    body="Great work! You've completed all the checkpoints. Use this tab to access your project and keep working on your own."
    onDismiss={onDismiss}
  />
);

export default FinalProjectCallout;

import {Typography, Button as MuiButton, ButtonProps} from '@mui/material';
import React, {useCallback, useState} from 'react';

import experiments, {StoredExperiment} from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './experimentsPage.module.scss';

export interface ServerExperiment {
  name: string;
  displayName: string | null;
  endAt: string | null;
  canLeave: boolean;
}

interface ExperimentsPageProps {
  serverExperiments: ServerExperiment[];
}

const formatDate = (timestamp: string | number) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const ActionButton: React.FC<ButtonProps> = props => (
  <MuiButton variant="outlined" color="secondary" size="small" {...props} />
);

const ExperimentsPage: React.FC<ExperimentsPageProps> = ({
  serverExperiments,
}) => {
  const [accountExperiments, setAccountExperiments] =
    useState(serverExperiments);
  const [browserExperiments, setBrowserExperiments] = useState<
    StoredExperiment[]
  >(() => experiments.getLocalStorageExperimentDetails());
  const [leaving, setLeaving] = useState<string[]>([]);

  const leaveAccountExperiment = useCallback(async (name: string) => {
    setLeaving(current => [...current, name]);
    try {
      await HttpClient.post(`/experiments/leave/${name}`, undefined, true);
      setAccountExperiments(current =>
        current.filter(experiment => experiment.name !== name)
      );
    } catch {
      // Leave the row in place; the button re-enables so the user can retry.
    } finally {
      setLeaving(current =>
        current.filter(leavingName => leavingName !== name)
      );
    }
  }, []);

  const disableBrowserExperiment = useCallback((key: string) => {
    experiments.setEnabled(key, false);
    setBrowserExperiments(experiments.getLocalStorageExperimentDetails());
  }, []);

  return (
    <div className={styles.page}>
      <Typography variant="h1">My experiments</Typography>

      <section>
        <Typography variant="h2">Browser experiments</Typography>
        <Typography variant="body2" className={styles.description}>
          Experiments enabled only in this browser.
        </Typography>
        {browserExperiments.length === 0 ? (
          <Typography variant="body2" className={styles.emptyState}>
            No experiments are enabled in this browser.
          </Typography>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Experiment</th>
                <th>Expires</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {browserExperiments.map(experiment => (
                <tr key={experiment.key}>
                  <td>
                    <code>{experiment.key}</code>
                  </td>
                  <td>
                    {experiment.expiration
                      ? formatDate(experiment.expiration)
                      : '—'}
                  </td>
                  <td className={styles.actionCell}>
                    <ActionButton
                      onClick={() => disableBrowserExperiment(experiment.key)}
                    >
                      Disable
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <Typography variant="h2">Account experiments</Typography>
        <Typography variant="body2" className={styles.description}>
          Experiments you have joined. They follow your account wherever you
          sign in.
        </Typography>
        {accountExperiments.length === 0 ? (
          <Typography variant="body2" className={styles.emptyState}>
            You haven't joined any experiments.
          </Typography>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Experiment</th>
                <th>Ends</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {accountExperiments.map(experiment => (
                <tr key={experiment.name}>
                  <td>
                    {experiment.displayName && (
                      <div>{experiment.displayName}</div>
                    )}
                    <code>{experiment.name}</code>
                  </td>
                  <td>
                    {experiment.endAt ? formatDate(experiment.endAt) : '—'}
                  </td>
                  <td className={styles.actionCell}>
                    {experiment.canLeave && (
                      <ActionButton
                        disabled={leaving.includes(experiment.name)}
                        onClick={() => leaveAccountExperiment(experiment.name)}
                      >
                        Leave
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ExperimentsPage;

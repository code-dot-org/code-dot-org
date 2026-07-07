import {Typography, Button as MuiButton} from '@mui/material';
import React, {useCallback, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import styles from './experimentsPage.module.scss';

export interface ServerExperiment {
  name: string;
  displayName: string | null;
  endAt: string | null;
  canLeave: boolean;
}

interface BrowserExperiment {
  key: string;
  expiration?: number;
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

const ExperimentsPage: React.FC<ExperimentsPageProps> = ({
  serverExperiments,
}) => {
  const [accountExperiments, setAccountExperiments] =
    useState(serverExperiments);
  const [browserExperiments, setBrowserExperiments] = useState<
    BrowserExperiment[]
  >(() => experiments.getLocalStorageExperimentDetails());
  const [leaving, setLeaving] = useState<string[]>([]);

  const leaveAccountExperiment = useCallback(async (name: string) => {
    setLeaving(current => [...current, name]);
    try {
      const response = await fetch(
        `/experiments/disable_single_user_experiment/${name}`,
        {credentials: 'same-origin'}
      );
      if (response.ok) {
        setAccountExperiments(current =>
          current.filter(experiment => experiment.name !== name)
        );
      }
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
      <Typography variant="h1">{i18n.experimentsPageTitle()}</Typography>

      <section>
        <Typography variant="h2">{i18n.experimentsAccountHeading()}</Typography>
        <Typography variant="body2" className={styles.description}>
          {i18n.experimentsAccountDescription()}
        </Typography>
        {accountExperiments.length === 0 ? (
          <Typography variant="body2" className={styles.emptyState}>
            {i18n.experimentsAccountNone()}
          </Typography>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{i18n.experimentsColumnName()}</th>
                <th>{i18n.experimentsColumnEndsAt()}</th>
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
                      <MuiButton
                        variant="outlined"
                        color="secondary"
                        size="small"
                        disabled={leaving.includes(experiment.name)}
                        onClick={() => leaveAccountExperiment(experiment.name)}
                      >
                        {i18n.experimentsLeave()}
                      </MuiButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <Typography variant="h2">{i18n.experimentsBrowserHeading()}</Typography>
        <Typography variant="body2" className={styles.description}>
          {i18n.experimentsBrowserDescription()}
        </Typography>
        {browserExperiments.length === 0 ? (
          <Typography variant="body2" className={styles.emptyState}>
            {i18n.experimentsBrowserNone()}
          </Typography>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{i18n.experimentsColumnName()}</th>
                <th>{i18n.experimentsColumnExpires()}</th>
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
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => disableBrowserExperiment(experiment.key)}
                    >
                      {i18n.experimentsDisable()}
                    </MuiButton>
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

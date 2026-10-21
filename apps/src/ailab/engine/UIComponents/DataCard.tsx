/* React component to show information about the currently-selected data set. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {type ReactNode, useEffect} from 'react';

import {
  getDatasetDetails,
  getUploadedFileName,
} from '../helpers/datasetDetails';
import {isPanelEnabled} from '../helpers/navigationValidation';
import {shallowEqual, useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {useProject} from '../ProjectContext';
import {setCurrentPanel} from '../redux';

import styles from './dataCard.module.scss';

interface CardRowProps {
  heading: string;
  children: ReactNode;
  isStat?: boolean;
}

const CardRow = ({heading, children, isStat = false}: CardRowProps) => (
  <div className={styles.section}>
    <Typography component="h5" variant="label3" className={styles.heading}>
      {heading}
    </Typography>
    <Typography
      variant={isStat ? 'body2' : 'body3'}
      className={classNames(isStat && styles.strong)}
    >
      {children}
    </Typography>
  </div>
);

const EmptyState = () => (
  <div className={styles.empty}>
    <span className={styles.emptyIcon}>
      <FontAwesomeV6Icon iconName="table" iconStyle="solid" />
    </span>
    <div className={styles.emptyText}>
      <Typography component="p" variant="body2" className={styles.strong}>
        No dataset selected
      </Typography>
      <Typography component="p" variant="body4" className={styles.emptyMessage}>
        Select a dataset to see its details here.
      </Typography>
    </div>
  </div>
);

const DATA_LENGTH_LIMIT = 20000;

const DataCard = () => {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const canUseDataset = useAppSelector(state =>
    isPanelEnabled(state, project, 'datasetView')
  );
  const hasSelection = useAppSelector(state => state.csvfile !== undefined);
  const name = useAppSelector(state => state.name);
  const uploadedFileName = useAppSelector(getUploadedFileName);
  const metadata = useAppSelector(state => state.metadata);
  const datasetDetails = useAppSelector(getDatasetDetails, shallowEqual);
  const dataLength = useAppSelector(state => state.data.length);
  const sampleRow = useAppSelector(state => state.data[0]);
  const removedRowsCount = useAppSelector(state => state.removedRowsCount);

  const card =
    Object.keys(metadata.card).length > 0 ? metadata.card : undefined;

  useEffect(() => {
    if (dataLength > DATA_LENGTH_LIMIT) {
      window.alert(
        I18n.t('dataCardWarningLargeDataset', {rowCount: DATA_LENGTH_LIMIT})
      );
    }
  }, [dataLength]);

  const removedRowsMsg =
    removedRowsCount > 0
      ? I18n.t('dataCardRemovedRows', {rowCount: removedRowsCount})
      : null;

  return (
    <div id="data-card" className={styles.panel}>
      <div className={styles.header}>
        <Typography component="h3" variant="overline2" className={styles.title}>
          About this data
        </Typography>
      </div>
      <div className={styles.content}>
        {dataLength === 0 ? (
          !hasSelection && <EmptyState />
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.section}>
                <Typography component="h4" variant="h6">
                  {name ?? uploadedFileName}
                </Typography>
                {card && (
                  <Typography variant="body3">
                    {datasetDetails.description}
                  </Typography>
                )}
              </div>
              <div className={styles.stats}>
                <CardRow heading="Rows" isStat>
                  {dataLength.toLocaleString('en')}
                </CardRow>
                {card?.lastUpdated && (
                  <CardRow heading="Last Updated" isStat>
                    {card.lastUpdated}
                  </CardRow>
                )}
              </div>
              {card?.context?.potentialUses && (
                <CardRow heading="Potential Uses">
                  {datasetDetails.potentialUses}
                </CardRow>
              )}
              {card?.context?.potentialMisuses && (
                <CardRow heading="Potential Misuses">
                  {datasetDetails.potentialMisuses}
                </CardRow>
              )}
              {card?.source && (
                <CardRow heading="Source">{card.source}</CardRow>
              )}
              {removedRowsMsg && (
                <div className={styles.section}>
                  <Typography variant="body3">{removedRowsMsg}</Typography>
                </div>
              )}
            </div>
            {datasetDetails.isUserUploaded && (
              <div className={styles.card}>
                <Typography
                  component="h5"
                  variant="label3"
                  className={classNames(styles.section, styles.heading)}
                >
                  Sample row
                </Typography>
                <dl className={styles.sampleRow}>
                  {Object.entries(sampleRow).map(([column, value]) => (
                    <div key={column} className={styles.sampleCell}>
                      <Typography component="dt" variant="body3">
                        {column}
                      </Typography>
                      <Typography
                        component="dd"
                        variant="body3"
                        className={classNames(
                          styles.strong,
                          styles.sampleValue
                        )}
                      >
                        {value}
                      </Typography>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.actionRow}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          endIcon={
            <FontAwesomeV6Icon iconName="arrow-right" aria-hidden="true" />
          }
          disabled={!canUseDataset}
          onClick={() => dispatch(setCurrentPanel('datasetView'))}
        >
          Use this dataset
        </Button>
      </div>
    </div>
  );
};

export default DataCard;

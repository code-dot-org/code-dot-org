/* React component to show information about the currently-selected data set. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React, {type ReactNode} from 'react';

import {
  getDatasetDetails,
  getUploadedFileName,
} from '../helpers/datasetDetails';
import {shallowEqual, useAppSelector} from '../hooks';
import I18n from '../i18n';

import styles from './dataCard.module.scss';

interface FactProps {
  heading: string;
  children: ReactNode;
}

const Fact = ({heading, children}: FactProps) => (
  <div className={styles.fact}>
    <Typography component="h4" variant="label3" className={styles.heading}>
      {heading}
    </Typography>
    <Typography variant="body3">{children}</Typography>
  </div>
);

const Stat = ({heading, children}: FactProps) => (
  <div className={styles.fact}>
    <Typography component="h4" variant="label3" className={styles.heading}>
      {heading}
    </Typography>
    <Typography variant="body2" className={styles.statValue}>
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
      <Typography component="p" variant="body2" className={styles.emptyTitle}>
        No dataset selected
      </Typography>
      <Typography component="p" variant="body4" className={styles.emptyMessage}>
        Select a dataset to see its details here.
      </Typography>
    </div>
  </div>
);

interface DataCardProps {
  canUseDataset: boolean;
  onUseDataset: () => void;
}

const DataCard = ({canUseDataset, onUseDataset}: DataCardProps) => {
  const name = useAppSelector(state => state.name);
  const uploadedFileName = useAppSelector(getUploadedFileName);
  const metadata = useAppSelector(state => state.metadata);
  const datasetDetails = useAppSelector(getDatasetDetails, shallowEqual);
  const dataLength = useAppSelector(state => state.data.length);
  const sampleRow = useAppSelector(state => state.data[0]);
  const removedRowsCount = useAppSelector(state => state.removedRowsCount);

  const card =
    Object.keys(metadata.card).length > 0 ? metadata.card : undefined;

  const dataLengthLimit = 20000;
  if (dataLength > dataLengthLimit) {
    window.alert(
      I18n.t('dataCardWarningLargeDataset', {rowCount: dataLengthLimit})
    );
  }

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
          <EmptyState />
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
                <Stat heading="Rows">{dataLength.toLocaleString('en')}</Stat>
                {card?.lastUpdated && (
                  <Stat heading="Last Updated">{card.lastUpdated}</Stat>
                )}
              </div>
              {card?.context?.potentialUses && (
                <div className={styles.section}>
                  <Fact heading="Potential Uses">
                    {datasetDetails.potentialUses}
                  </Fact>
                </div>
              )}
              {card?.context?.potentialMisuses && (
                <div className={styles.section}>
                  <Fact heading="Potential Misuses">
                    {datasetDetails.potentialMisuses}
                  </Fact>
                </div>
              )}
              {card?.source && (
                <div className={styles.section}>
                  <Fact heading="Source">{card.source}</Fact>
                </div>
              )}
              {removedRowsMsg && (
                <div className={styles.section}>
                  <Typography variant="body3">{removedRowsMsg}</Typography>
                </div>
              )}
            </div>
            {!card && (
              <div className={styles.card}>
                <Typography
                  component="h4"
                  variant="label3"
                  className={styles.sampleHeading}
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
                        className={styles.sampleValue}
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
          onClick={onUseDataset}
        >
          Use this dataset
        </Button>
      </div>
    </div>
  );
};

export default DataCard;

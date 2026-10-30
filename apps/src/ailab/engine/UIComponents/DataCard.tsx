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
import {getData, getMetadata, getRemovedRowsCount} from '../selectors';

import EmptyState from './EmptyState';
import SampleRow from './SampleRow';

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
    <Typography variant="body3" className={classNames(isStat && styles.strong)}>
      {children}
    </Typography>
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
  const metadata = useAppSelector(getMetadata);
  const datasetDetails = useAppSelector(getDatasetDetails, shallowEqual);
  const dataLength = useAppSelector(state => getData(state).length);
  const removedRowsCount = useAppSelector(getRemovedRowsCount);

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
          !hasSelection && (
            <EmptyState
              iconName="table"
              title="No dataset selected"
              message="Select a dataset to see its details here."
            />
          )
        ) : (
          <>
            <div className={styles.card}>
              <div className={classNames(styles.section, styles.intro)}>
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
            {datasetDetails.isUserUploaded && <SampleRow />}
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

/* React component to show information about the currently-selected data set. */
import {Typography} from '@mui/material';
import type {ReactNode} from 'react';

import {getDatasetDetails} from '../helpers/datasetDetails';
import {shallowEqual, useAppSelector} from '../hooks';
import I18n from '../i18n';

import styles from './dataCard.module.scss';

interface CardRowProps {
  heading: string | undefined;
  children: ReactNode;
}

const CardRow = ({heading, children}: CardRowProps) => (
  <div className={styles.row}>
    <Typography component="h4" variant="label3">
      {heading}
    </Typography>
    <Typography variant="body3">{children}</Typography>
  </div>
);

const DataCard = () => {
  const name = useAppSelector(state => state.name);
  const metadata = useAppSelector(state => state.metadata);
  const datasetDetails = useAppSelector(getDatasetDetails, shallowEqual);
  const dataLength = useAppSelector(state => state.data.length);
  const removedRowsCount = useAppSelector(state => state.removedRowsCount);

  const card =
    Object.keys(metadata.card).length > 0 ? metadata.card : undefined;

  const dataLengthLimit = 20000;
  if (dataLength > dataLengthLimit) {
    window.alert(
      I18n.t('dataCardWarningLargeDataset', {rowCount: dataLengthLimit}),
    );
  }

  const removedRowsMsg =
    removedRowsCount > 0
      ? I18n.t('dataCardRemovedRows', {rowCount: removedRowsCount})
      : null;

  return (
    dataLength !== 0 && (
      <div id="data-card" className={styles.panel}>
        <div className={styles.header}>
          <Typography
            component="h3"
            variant="overline2"
            className={styles.title}
          >
            {name || I18n.t('dataCardDefaultHeader')}
          </Typography>
        </div>
        <div className={styles.content}>
          {card && (
            <>
              <Typography variant="body3">
                {datasetDetails.description}
              </Typography>
              <CardRow heading={I18n.t('dataCardSource')}>
                {card.source}
              </CardRow>
              <CardRow heading={I18n.t('dataCardRowCount')}>
                {dataLength}
              </CardRow>
              {card.lastUpdated && (
                <CardRow heading={I18n.t('dataCardLastUpdated')}>
                  {card.lastUpdated}
                </CardRow>
              )}
              {card.context?.potentialUses && (
                <CardRow heading={I18n.t('dataCardPotentialUses')}>
                  {datasetDetails.potentialUses}
                </CardRow>
              )}
              {card.context?.potentialMisuses && (
                <CardRow heading={I18n.t('dataCardPotentialMisuses')}>
                  {datasetDetails.potentialMisuses}
                </CardRow>
              )}
            </>
          )}
          {!card && (
            <>
              <CardRow heading={I18n.t('dataCardRowCount')}>
                {dataLength}
              </CardRow>
              {removedRowsMsg && (
                <Typography variant="body3">{removedRowsMsg}</Typography>
              )}
            </>
          )}
        </div>
      </div>
    )
  );
};

export default DataCard;

/* React component to display imported data as one row per card. */
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useEffect, useMemo, useState} from 'react';

import {styles} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {deepEqual, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getTableData} from '../redux';

const DataCardsDeck = () => {
  const data = useAppSelector(state => getTableData(state, false), deepEqual);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const [currentRowIndex, setCurrentRowIndex] = useState(0);

  const columns = useMemo(() => {
    return data.length === 0 ? [] : Object.keys(data[0]);
  }, [data]);

  useEffect(() => {
    if (currentRowIndex >= data.length) {
      setCurrentRowIndex(Math.max(data.length - 1, 0));
    }
  }, [currentRowIndex, data.length]);

  if (data.length === 0) {
    return null;
  }

  const currentRow = data[currentRowIndex];
  const hasPrevious = currentRowIndex > 0;
  const hasNext = currentRowIndex < data.length - 1;

  const goToPreviousCard = () => {
    setCurrentRowIndex(index => Math.max(index - 1, 0));
  };

  const goToNextCard = () => {
    setCurrentRowIndex(index => Math.min(index + 1, data.length - 1));
  };

  return (
    <div style={styles.dataCardsDeck}>
      <div style={styles.dataCardsDeckControls}>
        <button
          type="button"
          onClick={goToPreviousCard}
          disabled={!hasPrevious}
          style={{
            ...styles.dataCardsDeckButton,
            ...(!hasPrevious ? styles.disabledButton : undefined),
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          {I18n.t('dataCardsDeckPrevious')}
        </button>
        <div style={styles.dataCardsDeckProgress} aria-live="polite">
          {I18n.t('dataCardsDeckProgress', {
            current: currentRowIndex + 1,
            total: data.length,
          })}
        </div>
        <button
          type="button"
          onClick={goToNextCard}
          disabled={!hasNext}
          style={{
            ...styles.dataCardsDeckButton,
            ...(!hasNext ? styles.disabledButton : undefined),
          }}
        >
          {I18n.t('dataCardsDeckNext')}
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <div style={styles.dataCardsDeckStage}>
        <div style={styles.dataCardsDeckBackCardFar} aria-hidden="true" />
        <div style={styles.dataCardsDeckBackCardNear} aria-hidden="true" />
        <article
          style={styles.dataCardsDeckCard}
          aria-label={I18n.t('dataCardsDeckCardAriaLabel', {
            rowNumber: currentRowIndex + 1,
          })}
        >
          <div style={styles.dataCardsDeckCardHeader}>
            {I18n.t('dataCardsDeckCardTitle', {
              rowNumber: currentRowIndex + 1,
            })}
          </div>
          <div style={styles.dataCardsDeckFieldsScroll}>
            <dl style={styles.dataCardsDeckFields}>
              {columns.map(columnId => (
                <div key={columnId} style={styles.dataCardsDeckField}>
                  <dt style={styles.dataCardsDeckFieldLabel}>
                    {getLocalizedColumnName(datasetId, columnId)}
                  </dt>
                  <dd style={styles.dataCardsDeckFieldValue}>
                    {getLocalizedValue(currentRow[columnId], datasetId)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </div>
    </div>
  );
};

export default DataCardsDeck;

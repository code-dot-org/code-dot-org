/* React component to handle displaying imported data. */
import {faIdCard, faTable} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {styles} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import type {DataDisplayView} from '../types';

import DataCardsDeck from './DataCardsDeck';
import DataTable from './DataTable';
import Statement from './Statement';

interface DataDisplayProps {
  showStatement?: boolean;
  showViewToggle?: boolean;
  viewMode?: DataDisplayView;
  setViewMode?: (viewMode: DataDisplayView) => void;
}

const DataDisplay = ({
  showStatement = true,
  showViewToggle = false,
  viewMode = 'table',
  setViewMode,
}: DataDisplayProps) => {
  const data = useAppSelector(state => state.data);

  if (data.length === 0) {
    return null;
  }

  const rowCount = data.length;
  const rowLimit = 100;
  const rowCountMessage =
    viewMode === 'cards' || rowCount <= rowLimit
      ? I18n.t('dataDisplayRowCount', {rowCount: rowCount})
      : I18n.t('dataDisplayRowCountTruncated', {
          rowCount: rowCount,
          rowLimit: rowLimit,
        });
  const viewToggleOptions: {
    id: DataDisplayView;
    label: string | undefined;
    icon: typeof faTable;
  }[] = [
    {id: 'table', label: I18n.t('dataDisplayTableView'), icon: faTable},
    {id: 'cards', label: I18n.t('dataDisplayCardsView'), icon: faIdCard},
  ];

  return (
    <div id="data-display" style={styles.panel}>
      {showViewToggle && (
        <div
          style={styles.dataDisplayViewToggle}
          role="group"
          aria-label={I18n.t('dataDisplayViewToggleAriaLabel')}
        >
          {viewToggleOptions.map(option => {
            const selected = viewMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setViewMode?.(option.id)}
                style={{
                  ...styles.dataDisplayViewToggleButton,
                  ...(selected
                    ? styles.dataDisplayViewToggleButtonSelected
                    : undefined),
                }}
              >
                <FontAwesomeIcon icon={option.icon} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
      {showStatement && <Statement />}
      {viewMode === 'cards' ? (
        <DataCardsDeck />
      ) : (
        <div style={styles.tableParent}>
          <DataTable />
        </div>
      )}
      <div style={styles.footerText}>{rowCountMessage}</div>
    </div>
  );
};

export default DataDisplay;

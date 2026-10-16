import classNames from 'classnames';
import React, {useMemo} from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getLocalizedColumnName, isRegression} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {ResultsData} from '../types';
import {useTableView} from '../useTableView';

import CellText from './CellText';
import ColumnHeader from './ColumnHeader';

import tableStyles from './dataTable.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
}

const featureHeader = classNames(
  tableStyles.header,
  tableStyles.headerFeature,
  styles.columnHeader
);
const labelHeader = classNames(
  tableStyles.header,
  tableStyles.headerLabel,
  styles.columnHeader
);
const featureCell = classNames(
  tableStyles.bodyCell,
  tableStyles.bodyCellFeature
);
const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);

const ResultsTable = ({results}: ResultsTableProps) => {
  const {project} = useProject();
  const selectedFeatures = project.selectedFeatures;
  const labelColumn = project.labelColumn || 'unknown';
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);

  // Keyed by position, since Actual and AI Prediction share the label's name.
  const sourceColumns = useMemo(
    () => [...selectedFeatures, labelColumn, labelColumn],
    [selectedFeatures, labelColumn]
  );
  const columns = useMemo(
    () => sourceColumns.map((_, index) => String(index)),
    [sourceColumns]
  );
  const columnTypes = useMemo(
    () =>
      Object.fromEntries(
        sourceColumns.map((column, index) => [index, columnsByDataType[column]])
      ),
    [sourceColumns, columnsByDataType]
  );
  const data = useMemo(
    () =>
      results.examples.map((example, row) =>
        Object.fromEntries(
          [
            ...example,
            results.labels[row],
            results.predictedLabels[row],
          ].entries()
        )
      ),
    [results]
  );
  const view = useTableView({data, columns, columnTypes});
  const actualColumn = String(selectedFeatures.length);
  const predictionColumn = String(selectedFeatures.length + 1);

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);
  const cellValue = (value: string | number) =>
    getLocalizedValue(value, datasetId);
  const labelName = columnName(labelColumn);

  return (
    <div className={styles.scroller}>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <table className={classNames(tableStyles.table, styles.table)}>
        <colgroup span={selectedFeatures.length} />
        <thead>
          <tr>
            <th
              scope="colgroup"
              colSpan={selectedFeatures.length}
              className={tableStyles.header}
            >
              <CellText>Feature</CellText>
            </th>
            <th scope="col" className={tableStyles.header}>
              <CellText>Actual</CellText>
            </th>
            <th scope="col" className={tableStyles.header}>
              <CellText>AI Prediction</CellText>
            </th>
          </tr>
          <tr>
            {selectedFeatures.map((feature, index) => (
              <ColumnHeader
                key={feature}
                column={String(index)}
                name={columnName(feature)}
                view={view}
                className={featureHeader}
              >
                <CellText>{columnName(feature)}</CellText>
              </ColumnHeader>
            ))}
            <ColumnHeader
              column={actualColumn}
              name={`Actual ${labelName}`}
              view={view}
              className={labelHeader}
            >
              <CellText>{labelName}</CellText>
            </ColumnHeader>
            <ColumnHeader
              column={predictionColumn}
              name={`AI Prediction ${labelName}`}
              view={view}
              className={labelHeader}
            >
              <CellText>{labelName}</CellText>
            </ColumnHeader>
          </tr>
        </thead>
        <tbody>
          {view.rows.map(row => (
            <tr key={row} className={tableStyles.row}>
              {results.examples[row].map((value, column) => (
                <td key={column} className={featureCell}>
                  <CellText>{cellValue(value)}</CellText>
                </td>
              ))}
              <td className={labelCell}>
                <CellText>{cellValue(results.labels[row])}</CellText>
              </td>
              <td className={labelCell}>
                <CellText>{cellValue(results.predictedLabels[row])}</CellText>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;

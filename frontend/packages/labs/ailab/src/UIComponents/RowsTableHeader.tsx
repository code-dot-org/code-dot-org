import classNames from 'classnames';
import React from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';

interface RowsTableHeaderProps {
  columns: string[];
  showPrediction?: boolean;
}

const RowsTableHeader = ({columns, showPrediction}: RowsTableHeaderProps) => {
  const {project} = useProject();
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const labelColumn = project.labelColumn || 'unknown';

  return (
    <tr>
      <th
        className={classNames(
          tableStyles.indexCell,
          tableStyles.indexHeader,
          tableStyles.indexColumn
        )}
        aria-label="Row"
      />
      {columns.map(column => (
        <th
          key={column}
          scope="col"
          className={classNames(tableStyles.header, {
            [tableStyles.headerLabel]: column === labelColumn,
            [tableStyles.headerFeature]:
              column !== labelColumn &&
              project.selectedFeatures.includes(column),
          })}
        >
          <CellText>{getLocalizedColumnName(datasetId, column)}</CellText>
        </th>
      ))}
      {showPrediction && (
        <th
          scope="col"
          className={classNames(tableStyles.header, tableStyles.headerLabel)}
        >
          <CellText>AI predicts</CellText>
        </th>
      )}
    </tr>
  );
};

export default RowsTableHeader;

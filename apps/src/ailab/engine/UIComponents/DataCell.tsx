import classNames from 'classnames';
import React, {type TdHTMLAttributes} from 'react';

import tableStyles from './dataTable.module.scss';

interface DataCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  isIdColumn: boolean;
}

const DataCell = ({isIdColumn, className, ...props}: DataCellProps) =>
  isIdColumn ? (
    <th
      scope="row"
      className={classNames(
        tableStyles.indexCell,
        tableStyles.idCell,
        className
      )}
      {...props}
    />
  ) : (
    <td className={classNames(tableStyles.bodyCell, className)} {...props} />
  );

export default DataCell;

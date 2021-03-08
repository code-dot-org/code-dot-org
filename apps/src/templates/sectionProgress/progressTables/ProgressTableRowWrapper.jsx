import React from 'react';
import classnames from 'classnames';

// styles rows: dark backgrounds, primary rows, expanded rows
export default function progressTableRowWrapper(rowData, formattedRow) {
  const rowClasses = classnames({
    'dark-row': rowData.hasDarkBackground,
    'primary-row': rowData.expansionIndex === 0,
    'expanded-row': rowData.expansionIndex > 0,
    'first-expanded-row': rowData.expansionIndex === 1
  });
  return <div className={rowClasses}>{formattedRow}</div>;
}

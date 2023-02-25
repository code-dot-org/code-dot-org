import React from 'react';
import PropTypes from 'prop-types';
import moduleStyles from './sections-refresh.module.scss';

export default function QuickAssignTable({marketingAudience, courseOfferings}) {
  const TABLE_COUNT = Object.keys(courseOfferings[marketingAudience]).length;

  const renderTable = headerIndex => {
    return (
      <table className={moduleStyles.table}>
        <thead>
          <tr className={moduleStyles.headerRow}>
            <td className={moduleStyles.headerCell}>
              <div>
                {Object.keys(courseOfferings[marketingAudience])[headerIndex]}
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          {JSON.stringify(
            Object.values(courseOfferings[marketingAudience])[headerIndex]
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className={moduleStyles.multiTables}>
      {0 < TABLE_COUNT && renderTable(0)}
      {1 < TABLE_COUNT && renderTable(1)}
      {2 < TABLE_COUNT && renderTable(2)}
      {3 < TABLE_COUNT && renderTable(3)}
    </div>
  );
}

QuickAssignTable.propTypes = {
  courseOfferings: PropTypes.object.isRequired,
  marketingAudience: PropTypes.string.isRequired
};

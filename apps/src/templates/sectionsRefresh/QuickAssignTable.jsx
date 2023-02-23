import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export default function QuickAssignTable({marketingAudience, courseOfferings}) {
  const TABLE_COUNT = Object.keys(courseOfferings[marketingAudience]).length;

  const renderTable = headerIndex => {
    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={styles.headerCell}>
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
    <div style={styles.multiTables}>
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

const styles = {
  multiTables: {
    display: 'flex'
  },
  table: {
    backgroundColor: color.neutral_dark10,
    margin: '4px'
  },
  headerRow: {
    backgroundColor: color.brand_primary_default,
    color: color.white
  },
  headerCell: {
    fontWeight: 500,
    fontSize: '24px',
    padding: '12px'
  }
};

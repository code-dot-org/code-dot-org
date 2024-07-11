import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';
import Skeleton from '@cdo/apps/util/loadingSkeleton';

// Returns an array of rows, each with the given number of cells containing
// a Skeleton element.
const SkeletonRows = ({numRows, numCols}) => {
  return _.times(numRows, rowIndex => (
    <tr key={rowIndex}>
      {_.times(numCols, colIndex => (
        <td key={colIndex} style={styles.tableCell}>
          <Skeleton />
        </td>
      ))}
    </tr>
  ));
};

SkeletonRows.propTypes = {
  numRows: PropTypes.number.isRequired,
  numCols: PropTypes.number.isRequired,
};

const styles = {
  tableCell: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    padding: 10,
  },
};

export default SkeletonRows;

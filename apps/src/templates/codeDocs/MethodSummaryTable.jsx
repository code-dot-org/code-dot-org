import PropTypes from 'prop-types';
import React from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';

export default function MethodSummaryTable({methods}) {
  return (
    <table style={{...tableLayoutStyles.table, width: '100%'}}>
      <tbody>
        {methods.map(method => (
          <tr key={method.key}>
            <td style={styles.method}>
              <h3>
                <button
                  type="button"
                  onClick={() => $(`#method-${method.key}`)[0].scrollIntoView()}
                  aria-label="link to details"
                  style={{
                    ...styles.methodLink,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                  }}
                >
                  {method.name}
                </button>
              </h3>
              {method.content && (
                <EnhancedSafeMarkdown markdown={method.content} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

MethodSummaryTable.propTypes = {
  methods: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const styles = {
  method: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.lighter_gray,
    padding: 5,
  },
  methodLink: {
    cursor: 'pointer',
  },
};

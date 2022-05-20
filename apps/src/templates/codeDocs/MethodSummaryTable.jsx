import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import {TextLink} from '@dsco_/link';

export default function MethodSummaryTable({
  methods,
  programmingClassLink,
  openLinkInNewTab = false
}) {
  return (
    <table style={{...tableLayoutStyles.table, width: '100%'}}>
      <tbody>
        {methods.map(method => (
          <tr key={method.key}>
            <td style={styles.method}>
              <h3>
                {method.name}
                {programmingClassLink && (
                  <>
                    {' '}
                    <TextLink
                      href={`${programmingClassLink}#method-${method.key}`}
                      openInNewTab={openLinkInNewTab}
                      icon={<FontAwesome icon="external-link" />}
                    />
                  </>
                )}
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
  programmingClassLink: PropTypes.string,
  openLinkInNewTab: PropTypes.bool
};

const styles = {
  method: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.lighter_gray,
    padding: 5
  }
};

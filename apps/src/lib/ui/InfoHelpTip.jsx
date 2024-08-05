import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

export default function InfoHelpTip({id, content}) {
  return (
    <span style={{marginLeft: '12px'}}>
      <span data-tip data-for={id}>
        <FontAwesome icon="info-circle" style={styles.infoTipIcon} />
      </span>
      <ReactTooltip id={id} role="tooltip" effect="solid">
        <div style={styles.infoToolTipBox}>
          <BodyTwoText style={styles.infoToolTipText}>{content}</BodyTwoText>
        </div>
      </ReactTooltip>
    </span>
  );
}

InfoHelpTip.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

const styles = {
  infoTipIcon: {
    cursor: 'pointer',
    marginLeft: '5px',
    marginRight: '5px',
    fontSize: '18px',
    verticalAlign: 'middle',
    color: 'gray',
  },
  infoToolTipBox: {
    maxWidth: '400px',
    whiteSpace: 'normal',
    textAlign: 'left',
  },
  infoToolTipText: {
    fontSize: '13px',
    color: color.neutral_white,
    marginBottom: '0',
  },
};

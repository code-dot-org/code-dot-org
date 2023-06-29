import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';

export default function InfoHelpTip({id, content}) {
  return (
    <div>
      <span data-tip data-for={id}>
        <FontAwesome icon="info-circle" style={styles.infoTipIcon} />
      </span>
      <ReactTooltip id={id} role="tooltip" effect="solid">
        <div style={{maxWidth: 400}}>{content}</div>
      </ReactTooltip>
    </div>
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
};

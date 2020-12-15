import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import FontAwesome from '../../templates/FontAwesome';
import _ from 'lodash';

// Help Tip without the Portal feature, which breaks on Modals
export default function HelpTipModal({children}) {
  const id = _.uniqueId();

  return (
    <span data-for={id} data-tip>
      <FontAwesome
        icon="question-circle-o"
        style={{cursor: 'pointer', marginLeft: '0.5em', marginRight: '0.5em'}}
      />
      <ReactTooltip id={id} role="tooltip" effect="solid">
        <div style={{maxWidth: 400}}>{children}</div>
      </ReactTooltip>
    </span>
  );
}
HelpTipModal.propTypes = {
  children: PropTypes.node.isRequired
};

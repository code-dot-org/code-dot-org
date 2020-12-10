import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Portal from 'react-portal';
import FontAwesome from '../../templates/FontAwesome';
import _ from 'lodash';

export default function HelpTip({children}) {
  const id = _.uniqueId();

  return (
    <span data-for={id} data-tip>
      <FontAwesome
        icon="question-circle-o"
        style={{cursor: 'pointer', marginLeft: '0.5em', marginRight: '0.5em'}}
      />
      <Portal isOpened={true}>
        <ReactTooltip id={id} role="tooltip" effect="solid">
          <div style={{maxWidth: 400}}>{children}</div>
        </ReactTooltip>
      </Portal>
    </span>
  );
}
HelpTip.propTypes = {
  children: PropTypes.node.isRequired
};

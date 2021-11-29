import React from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
var msg = require('@cdo/locale');

const IMAGE_BASE_URL = '/blockly/media/';

export default class ProjectTemplateWorkspaceIcon extends React.Component {
  constructor(props) {
    super(props);
    this.tooltipId = _.uniqueId();
  }

  render() {
    return (
      <div style={styles.container}>
        <img
          style={styles.projectTemplateIcon}
          className="projectTemplateWorkspaceIcon"
          src={IMAGE_BASE_URL + 'connect.svg'}
          data-tip
          data-for={this.tooltipId}
          aria-describedby={this.tooltipId}
        />
        <ReactTooltip
          id={this.tooltipId}
          role="tooltip"
          wrapper="div"
          effect="solid"
        >
          <div style={styles.tooltip}>
            {msg.workspaceProjectTemplateLevel()}
          </div>
        </ReactTooltip>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'inline'
  },
  tooltip: {
    maxWidth: 200,
    lineHeight: '20px',
    whiteSpace: 'normal'
  },
  projectTemplateIcon: {
    marginRight: 5,
    marginTop: -1
  }
};

import React from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
var msg = require('@cdo/locale');

const IMAGE_BASE_URL = '/blockly/media/';

const styles = {
  container: {
    display: 'inline',
  },
  tooltip: {
    maxWidth: 200,
    lineHeight: '20px',
    whiteSpace: 'normal',
  },
  projectTemplateIcon: {
    marginRight: 5,
    marginTop: -1,
  },
};

const ProjectTemplateWorkspaceIcon = React.createClass({

  render() {
    const tooltipId = _.uniqueId();

    return (
      <div
        style={styles.container}
      >
        <img
          style={styles.projectTemplateIcon}
          src={IMAGE_BASE_URL + 'connect.svg'}
          data-tip data-for={tooltipId}
          aria-describedby={tooltipId}
        />
        <ReactTooltip
          id={tooltipId}
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
});

export default ProjectTemplateWorkspaceIcon;

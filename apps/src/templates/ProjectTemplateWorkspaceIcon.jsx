import React from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moduleStyles from './project-template-workspace-icon.module.scss';
var msg = require('@cdo/locale');

const IMAGE_BASE_URL = '/blockly/media/';

export default class ProjectTemplateWorkspaceIcon extends React.Component {
  static propTypes = {
    place: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.tooltipId = _.uniqueId();
  }

  render() {
    return (
      <div style={styles.container}>
        <button
          type="button"
          data-tip
          data-for={this.tooltipId}
          aria-describedby={this.tooltipId}
          data-event="mouseenter mouseleave click"
          className={moduleStyles.projectTemplateButton}
        >
          <img
            style={styles.projectTemplateIcon}
            className="projectTemplateWorkspaceIcon"
            src={IMAGE_BASE_URL + 'connect.svg'}
            alt={msg.workspaceProjectTemplateLevel()}
          />
        </button>
        <ReactTooltip
          id={this.tooltipId}
          role="tooltip"
          wrapper="div"
          effect="solid"
          place={this.props.place}
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
    display: 'inline-block',
  },
  tooltip: {
    maxWidth: 200,
    lineHeight: '20px',
    whiteSpace: 'normal',
  },
  projectTemplateIcon: {
    marginRight: 5,
    padding: 10,
  },
};

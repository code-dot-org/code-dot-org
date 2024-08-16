import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import moduleStyles from './project-template-workspace-icon.module.scss';

var msg = require('@cdo/locale');

const IMAGE_BASE_URL = '/blockly/media/';

export default class ProjectTemplateWorkspaceIcon extends React.Component {
  static propTypes = {
    tooltipPlace: PropTypes.string,
    dark: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.tooltipId = _.uniqueId();
  }

  render() {
    return (
      <div className={moduleStyles.container}>
        <button
          type="button"
          data-tip
          data-for={this.tooltipId}
          aria-describedby={this.tooltipId}
          data-event="mouseenter mouseleave click"
          className={moduleStyles.projectTemplateButton}
        >
          <img
            className={classNames(
              'projectTemplateWorkspaceIcon',
              moduleStyles.projectTemplateIcon
            )}
            src={
              IMAGE_BASE_URL +
              (this.props.dark ? 'connect-dark.svg' : 'connect.svg')
            }
            alt={msg.workspaceProjectTemplateLevel()}
          />
        </button>
        <ReactTooltip
          id={this.tooltipId}
          role="tooltip"
          wrapper="div"
          effect="solid"
          place={this.props.tooltipPlace}
        >
          <div className={moduleStyles.tooltip}>
            {msg.workspaceProjectTemplateLevel()}
          </div>
        </ReactTooltip>
      </div>
    );
  }
}

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';
import styleConstants from '@cdo/apps/styleConstants';
import msg from '@cdo/locale';

import SettingsCog from '../code-studio/components/SettingsCog';
import commonStyles from '../commonStyles';
import PaneHeader, {PaneButton, PaneSection} from '../templates/PaneHeader';
import ProjectTemplateWorkspaceIcon from '../templates/ProjectTemplateWorkspaceIcon';
import color from '../util/color';

export default class DesignModeHeaders extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    onToggleToolbox: PropTypes.func.isRequired,
    isToolboxVisible: PropTypes.bool.isRequired,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    showMakerToggle: PropTypes.bool.isRequired,
    autogenerateML: PropTypes.func,
  };

  onToggleToolbox = () => this.props.onToggleToolbox();

  chevronStyle(collapse) {
    const style = {
      display: 'inline-block',
      position: 'absolute',
      padding: 0,
      margin: 0,
      top: 0,
      left: this.props.isRtl ? '' : 8,
      right: this.props.isRtl ? 8 : '',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      lineHeight: styleConstants['workspace-headers-height'] + 'px',
      fontSize: 18,
      cursor: 'pointer',
      color: color.neutral_white,
      ':hover': {
        color: color.neutral_dark20,
      },
    };

    if (collapse) {
      style.transform = 'scale(-1, 1)';
    }

    return style;
  }

  hideToolboxIcon() {
    return (
      <button
        className="hide-toolbox-icon"
        type="button"
        style={[commonStyles.hidden, this.chevronStyle(!this.props.isRtl)]}
        onClick={this.onToggleToolbox}
      >
        <i className="fa fa-chevron-circle-right" />
      </button>
    );
  }

  showToolboxIcon() {
    return (
      <button
        type="button"
        style={[commonStyles.hidden, this.chevronStyle(this.props.isRtl)]}
        className="show-toolbox-icon"
      >
        <i className="fa fa-chevron-circle-right" />
      </button>
    );
  }

  render() {
    const styles = {
      toolboxHeader: {
        display: this.props.isToolboxVisible ? 'flex' : 'none',
        justifyContent: 'space-between',
        width: 270,
        borderLeft: this.props.isRtl ? '1px solid gray' : '',
        borderRight: this.props.isRtl ? '' : '1px solid gray',
        float: this.props.isRtl ? 'right' : 'left',
      },
      showToolboxHeader: {
        float: this.props.isRtl ? 'right' : 'left',
        display: this.props.isToolboxVisible ? 'none' : 'flex',
        justifyContent: 'space-between',
        paddingLeft: this.props.isRtl ? '' : 10,
        paddingRight: this.props.isRtl ? 10 : '',
      },
      showToolboxClickable: {
        marginLeft: this.props.isRtl ? '' : 18,
        marginRight: this.props.isRtl ? 18 : '',
        ':hover': {
          color: color.white,
        },
      },
      iconContainer: {
        float: this.props.isRtl ? 'left' : 'right',
        marginRight: 10,
        marginLeft: 10,
        height: '100%',
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle',
      },
      runningVersionHistoryButton: {
        color: color.dark_charcoal,
      },
    };

    const hasFocus = !this.props.isRunning;

    const settingsCog = (
      <SettingsCog
        isRunning={this.props.isRunning}
        showMakerToggle={this.props.showMakerToggle}
        runModeIndicators
        autogenerateML={this.props.autogenerateML}
      />
    );

    return (
      <PaneHeader
        id="design-headers"
        dir={this.props.isRtl ? 'rtl' : 'ltr'}
        hasFocus={hasFocus}
        style={{color: 'white'}}
      >
        <PaneSection
          id="design-toolbox-header"
          className={classNames(
            'workspace-header',
            this.props.isRunning && 'is-running'
          )}
          style={styles.toolboxHeader}
        >
          <span>{this.hideToolboxIcon()}</span>
          <span>{applabMsg.designToolboxHeader()}</span>
          <span>{settingsCog}</span>
        </PaneSection>
        <PaneSection
          className={classNames(
            'workspace-header',
            this.props.isRunning && 'is-running'
          )}
          style={styles.showToolboxHeader}
        >
          <span
            key="show-toolbox-clickable"
            className="workspace-header-clickable"
            style={styles.showToolboxClickable}
            onClick={this.onToggleToolbox}
          >
            {this.showToolboxIcon()}
          </span>
          <span>{msg.showToolbox()}</span>
          <span>{settingsCog}</span>
        </PaneSection>
        <PaneButton
          id="design-mode-versions-header"
          style={this.props.isRunning ? styles.runningVersionHistoryButton : {}}
          iconClass="fa fa-clock-o"
          label={msg.showVersionsHeader()}
          headerHasFocus={hasFocus}
          isRtl={this.props.isRtl}
          onClick={this.props.handleVersionHistory}
        />
        <PaneSection
          id="design-workspace-header"
          className={classNames(
            'workspace-header',
            this.props.isRunning && 'is-running'
          )}
        >
          {this.props.showProjectTemplateWorkspaceIcon && (
            <ProjectTemplateWorkspaceIcon />
          )}
          <span>{applabMsg.designWorkspaceHeader()}</span>
        </PaneSection>
      </PaneHeader>
    );
  }
}

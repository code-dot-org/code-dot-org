import React from 'react';
import applabMsg from '@cdo/applab/locale';
import msg from '@cdo/locale';
import commonStyles from '../commonStyles';
import color from '../util/color';
import PaneHeader, {PaneButton, PaneSection} from '../templates/PaneHeader';
import SettingsCog from '../lib/ui/SettingsCog';

const DesignModeHeaders = React.createClass({
  propTypes: {
    handleVersionHistory: React.PropTypes.func.isRequired,
    onToggleToolbox: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isRunning: React.PropTypes.bool.isRequired,
  },

  onToggleToolbox: function () {
    this.props.onToggleToolbox();
  },

  chevronStyle(collapse) {
    const style = {
      display: 'inline-block',
      position: 'absolute',
      top: 0,
      left: 8,
      lineHeight: '30px',
      fontSize: 18,
      cursor: 'pointer',
      color: this.props.isRunning ? color.dark_charcoal : color.lighter_purple,
      ':hover': {
        color: color.white,
      },
    };

    if (collapse) {
      style.transform = 'scale(-1, 1)';
    }

    return style;
  },

  hideToolboxIcon() {
    return (
      <i
        style={[commonStyles.hidden, this.chevronStyle(true)]}
        className="hide-toolbox-icon fa fa-chevron-circle-right"
        onClick={this.onToggleToolbox}
      />
    );
  },

  showToolboxIcon() {
    return (
      <i
        style={[commonStyles.hidden, this.chevronStyle(false)]}
        className="show-toolbox-icon fa fa-chevron-circle-right"
      />
    );
  },

  render: function () {
    var styles = {
      toolboxHeader: {
        display: this.props.isToolboxVisible ? 'block' : 'none',
        width: 270,
        borderRight: '1px solid gray',
        float: 'left'
      },
      showToolboxHeader: {
        float: 'left',
        display: this.props.isToolboxVisible ? 'none' : 'block',
        paddingLeft: 10
      },
      showToolboxClickable: {
        marginLeft: 18,
        ':hover': {
          color: color.white,
        },
      },
      iconContainer: {
        float: 'right',
        marginRight: 10,
        marginLeft: 10,
        height: '100%'
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle'
      }
    };

    const hasFocus = !this.props.isRunning;

    const settingsCog = <SettingsCog isRunning={this.props.isRunning} runModeIndicators/>;

    return (
      <PaneHeader
        id="design-headers"
        dir={this.props.isRtl ? 'rtl' : 'ltr'}
        hasFocus={hasFocus}
        style={{color: 'white'}}
      >
        <PaneSection id="design-toolbox-header" className="workspace-header" style={styles.toolboxHeader}>
          {this.hideToolboxIcon()}
          {settingsCog}
          <span>{applabMsg.designToolboxHeader()}</span>
        </PaneSection>
        <PaneSection
          className="workspace-header"
          style={styles.showToolboxHeader}
        >
          <span
            key="show-toolbox-clickable"
            className="workspace-header-clickable"
            style={styles.showToolboxClickable}
            onClick={this.onToggleToolbox}
          >
            {this.showToolboxIcon()}
            {msg.showToolbox()}
          </span>
          {settingsCog}
        </PaneSection>
        <PaneButton
          id="design-mode-versions-header"
          iconClass="fa fa-clock-o"
          label={msg.showVersionsHeader()}
          headerHasFocus={hasFocus}
          isRtl={this.props.isRtl}
          onClick={this.props.handleVersionHistory}
        />
        <PaneSection id="design-workspace-header" className="workspace-header">
          <span>{applabMsg.designWorkspaceHeader()}</span>
        </PaneSection>
      </PaneHeader>
    );
  }
});
export default DesignModeHeaders;

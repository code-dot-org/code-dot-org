import React from 'react';
import applabMsg from '@cdo/applab/locale';
import msg from '@cdo/locale';
import FontAwesome from '../templates/FontAwesome';
import PaneHeader, {PaneButton, PaneSection} from '../templates/PaneHeader';

const DesignModeHeaders = React.createClass({
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    handleVersionHistory: React.PropTypes.func.isRequired,
    onToggleToolbox: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired,
    localeDirection: React.PropTypes.oneOf(['rtl', 'ltr']).isRequired,
    isRunning: React.PropTypes.bool.isRequired,
  },

  handleManageAssets: function () {
    this.props.handleManageAssets();
  },

  onToggleToolbox: function () {
    this.props.onToggleToolbox();
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

    var manageAssetsIcon = (
      <span style={styles.iconContainer}>
        <FontAwesome
          icon="cog"
          className="workspace-header-clickable"
          id="manage-assets-button"
          style={styles.assetsIcon}
          onClick={this.handleManageAssets}
          title={applabMsg.manageAssets()}
        />
      </span>
    );

    const isRtl = this.props.localeDirection === 'rtl';
    const hasFocus = !this.props.isRunning;

    return (
      <PaneHeader
        id="design-headers"
        dir={this.props.localeDirection}
        hasFocus={hasFocus}
        style={{color: 'white'}}
      >
        <PaneSection id="design-toolbox-header" className="workspace-header" style={styles.toolboxHeader}>
          {manageAssetsIcon}
          <span>{applabMsg.designToolboxHeader()}</span>
          <span className="workspace-header-clickable" onClick={this.onToggleToolbox}>&nbsp;{msg.hideToolbox()}</span>
        </PaneSection>
        <PaneSection
          className="workspace-header"
          onClick={this.onToggleToolbox}
          style={styles.showToolboxHeader}
        >
          <span className="workspace-header-clickable">{msg.showToolbox()}</span>
          {manageAssetsIcon}
        </PaneSection>
        <PaneButton
          id="design-mode-versions-header"
          iconClass="fa fa-clock-o"
          label={msg.showVersionsHeader()}
          headerHasFocus={hasFocus}
          isRtl={isRtl}
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

var applabMsg = require('./locale');
var msg = require('../locale');

module.exports = React.createClass({
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    onToggleToolbox: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired
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
        <i className="fa fa-cog workspace-header-clickable"
          id="manage-assets-button"
          style={styles.assetsIcon}
          onClick={this.handleManageAssets}
          title={applabMsg.manageAssets()}></i>
      </span>
    );

    return (
      <div id="design-headers">
        <div id="design-toolbox-header" className="workspace-header" style={styles.toolboxHeader}>
          {manageAssetsIcon}
          <span>{applabMsg.designToolboxHeader()}</span>
          <span className="workspace-header-clickable" onClick={this.onToggleToolbox}>&nbsp;{msg.hideToolbox()}</span>
        </div>
        <div className="workspace-header" onClick={this.onToggleToolbox}
            style={styles.showToolboxHeader}>
          <span className="workspace-header-clickable">{msg.showToolbox()}</span>
          {manageAssetsIcon}
        </div>
        <div id="design-workspace-header" className="workspace-header">
          <span>{applabMsg.designWorkspaceHeader()}</span>
        </div>
      </div>
    );
  }
});

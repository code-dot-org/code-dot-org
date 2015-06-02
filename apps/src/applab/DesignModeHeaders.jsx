var React = require('react');
var applabMsg = require('./locale');

module.exports = React.createClass({
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired
  },

  handleManageAssets: function() {
    this.props.handleManageAssets();
  },

  render: function() {
    var styles = {
      toolboxHeader: {
        width: 270,
        borderRight: '1px solid gray',
        float: 'left'
      },
      iconContainer: {
        float: 'right',
        marginRight: 10,
        height: '100%'
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle'
      }
    };
    
    return (
      <div>
        <div id="design-toolbox-header" className="workspace-header" style={styles.toolboxHeader}>
          <span>{applabMsg.designToolboxHeader()}</span>
          <span style={styles.iconContainer}>
            <i className="fa fa-cog toolbar-clickable"
                style={styles.assetsIcon}
                onClick={this.handleManageAssets}
                title={applabMsg.manageAssets()}></i>
          </span>
        </div>
        <div id="design-workspace-header" className="workspace-header">
          <span>{applabMsg.designWorkspaceHeader()}</span>
        </div>
      </div>
    );
  }
});

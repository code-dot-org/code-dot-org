var React = require('react');
var applabMsg = require('./locale');

module.exports = React.createClass({
  render: function() {
    var styles = {
      toolboxHeader: {
        width: 270,
        borderRight: '1px solid gray',
        float: 'left'
      }
    };
    
    return (
      <div>
        <div id="design-toolbox-header" className="workspace-header" style={styles.toolboxHeader}>
          <span>{applabMsg.designToolboxHeader()}</span>
        </div>
        <div id="design-workspace-header" className="workspace-header">
          <span>{applabMsg.designWorkspaceHeader()}</span>
        </div>
      </div>
    );
  }
});

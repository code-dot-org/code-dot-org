var React = require('react')
var applabMsg = require('./locale')

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <div id="design-toolbox-header" className="workspace-header">
          <span>{applabMsg.designToolboxHeader()}</span>
        </div>
        <div id="design-workspace-header" className="workspace-header">
          <span>{applabMsg.designWorkspaceHeader()}</span>
        </div>
      </div>
    )
  }
});

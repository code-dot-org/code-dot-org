import React from 'react';

const DataWorkspace = React.createClass({
  propTypes: {
    style: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <div id="dataWorkspaceWrapper" style={this.props.style}>
        Data workspace
      </div>
    );
  }
});
export default DataWorkspace;

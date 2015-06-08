var React = require('react');
var applabMsg = require('./locale');
var DesignModeBox = require('./DesignModeBox.jsx');
var DesignModeHeaders = require('./DesignModeHeaders.jsx');

module.exports = React.createClass({
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      isToolboxVisible: true
    };
  },

  onToggleToolbox: function() {
    this.setState({
      isToolboxVisible: !this.state.isToolboxVisible
    });
  },

  render: function() {
    return <div id="designWorkspaceWrapper">
      <DesignModeHeaders
        handleManageAssets={this.props.handleManageAssets}
        onToggleToolbox={this.onToggleToolbox}
        isToolboxVisible={this.state.isToolboxVisible} />
      <DesignModeBox
        handleDragStart={this.props.handleDragStart}
        element={this.props.element}
        handleChange={this.props.handleChange}
        onDepthChange={this.props.onDepthChange}
        onDelete={this.props.onDelete}
        isToolboxVisible={this.state.isToolboxVisible} />
    </div>;
  }
});
